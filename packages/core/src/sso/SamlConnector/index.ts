import {
  ConnectorError,
  ConnectorErrorCodes,
  type GetSession,
  type SetSession,
} from '@logto/connector-kit';
import { assert, appendPath } from '@silverhand/essentials';
import * as saml from 'samlify';
import { z } from 'zod';

import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';

import {
  type BaseSamlConfig,
  type BaseSamlConnectorConfig,
  attributeMappingPostProcessor,
} from '../types/saml.js';

import {
  fetchSamlConfig,
  getRawSamlConfig,
  getUserInfoFromRawUserProfile,
  samlAssertionHandler,
} from './utils.js';

class SamlConnector {
  private readonly _acsUrl: string;
  constructor(
    private readonly config: BaseSamlConnectorConfig,
    tenantId: string,
    ssoConnectorId: string
  ) {
    this._acsUrl = appendPath(
      getTenantEndpoint(tenantId, EnvSet.values),
      `api/authn/saml/sso/${ssoConnectorId}`
    ).toString();
  }

  get acsUrl() {
    return this._acsUrl;
  }

  /* Fetch SAML config from the metadata XML file or metadata URL. Throws error if config is invalid. */
  getSamlConfig = async (): Promise<BaseSamlConfig> => {
    const samlConfig = await fetchSamlConfig(this.config);

    return {
      ...samlConfig,
      ...this.config,
    };
  };

  getIdpMetadata = async () => {
    return getRawSamlConfig(this.config);
  };

  getAuthorizationUrl = async (
    {
      state,
      redirectUri,
      jti,
    }: {
      state: string;
      redirectUri: string;
      jti: string;
    },
    setSession: SetSession
  ) => {
    const {
      entityId: entityID,
      x509Certificate,
      nameIdFormat,
      signingAlgorithm,
    } = await this.getSamlConfig();

    assert(
      setSession,
      new ConnectorError(ConnectorErrorCodes.NotImplemented, {
        message: 'Function `setSession()` is not implemented.',
      })
    );

    const storage = { state, redirectUri, jti };
    await setSession(storage);

    try {
      const idpMetadataXml = await getRawSamlConfig(this.config);
      // eslint-disable-next-line new-cap
      const identityProvider = saml.IdentityProvider({
        wantAuthnRequestsSigned: true, // Sign auth request by default
        metadata: idpMetadataXml,
      });
      // eslint-disable-next-line new-cap
      const serviceProvider = saml.ServiceProvider({
        entityID,
        relayState: jti,
        nameIDFormat: nameIdFormat,
        signingCert: x509Certificate,
        authnRequestsSigned: true, // Sign auth request by default
        requestSignatureAlgorithm: signingAlgorithm,
        assertionConsumerService: [
          {
            Location: this._acsUrl,
            Binding: saml.Constants.BindingNamespace.Post,
          },
        ],
      });

      const loginRequest = serviceProvider.createLoginRequest(identityProvider, 'redirect');

      return loginRequest.context;
    } catch (error: unknown) {
      throw new ConnectorError(ConnectorErrorCodes.General, error);
    }
  };

  getUserInfo = async (_data: unknown, getSession: GetSession) => {
    const parsedConfig = await this.getSamlConfig();
    const { attributeMapping } = parsedConfig;
    const profileMap = attributeMappingPostProcessor(attributeMapping);

    assert(
      getSession,
      new ConnectorError(ConnectorErrorCodes.NotImplemented, {
        message: 'Function `getSession()` is not implemented.',
      })
    );
    const { extractedRawProfile } = await getSession();

    const extractedRawProfileGuard = z.record(z.string().or(z.array(z.string())));
    const rawProfileParseResult = extractedRawProfileGuard.safeParse(extractedRawProfile);

    if (!rawProfileParseResult.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, rawProfileParseResult.error);
    }

    const rawUserProfile = rawProfileParseResult.data;

    return getUserInfoFromRawUserProfile(rawUserProfile, profileMap);
  };

  validateSamlAssertion = async (
    assertion: Record<string, unknown>,
    getSession: GetSession,
    setSession: SetSession
  ): Promise<string> => {
    const parsedConfig = await this.getSamlConfig();
    const idpMetadataXml = await this.getIdpMetadata();

    const connectorSession = await getSession();
    const { redirectUri, state } = connectorSession;

    await samlAssertionHandler(assertion, { ...parsedConfig, idpMetadataXml }, setSession);

    assert(
      state,
      new ConnectorError(ConnectorErrorCodes.General, {
        message: 'Can not find `state` from connector session.',
      })
    );
    assert(
      redirectUri,
      new ConnectorError(ConnectorErrorCodes.General, {
        message: 'Can not find `redirectUri` from connector session.',
      })
    );

    const queryParameters = new URLSearchParams({ state });

    return `${redirectUri}?${queryParameters.toString()}`;
  };
}

export default SamlConnector;
