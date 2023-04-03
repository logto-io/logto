import { assert } from '@silverhand/essentials';
import { z } from 'zod';

import type {
  GetAuthorizationUri,
  GetUserInfo,
  SocialConnector,
  CreateConnector,
  GetConnectorConfig,
  ValidateSamlAssertion,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
} from '@logto/connector-kit';
import * as saml from 'samlify';

import { defaultMetadata } from './constant.js';
import { samlConfigGuard } from './types.js';
import type { SamlConfig } from './types.js';
import { samlAssertionHandler, getUserInfoFromRawUserProfile } from './utils.js';

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri, connectorId, connectorFactoryId, jti }, setSession) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig<SamlConfig>(config, samlConfigGuard);
    const {
      entityID,
      x509Certificate,
      idpMetadataXml,
      signAuthnRequest,
      privateKey,
      privateKeyPass,
      nameIDFormat,
      requestSignatureAlgorithm,
      assertionConsumerServiceUrl,
    } = samlConfigGuard.parse(config);

    assert(
      connectorId,
      new ConnectorError(ConnectorErrorCodes.InvalidRequestParameters, {
        message: 'Can not find string-typed variable `connectorId` from connector session.',
      })
    );

    assert(
      connectorFactoryId,
      new ConnectorError(ConnectorErrorCodes.InvalidRequestParameters, {
        message: 'Can not find string-typed variable `connectorFactoryId` from connector session.',
      })
    );

    assert(
      setSession,
      new ConnectorError(ConnectorErrorCodes.NotImplemented, {
        message: 'Function `setSession()` is not implemented.',
      })
    );

    const storage = { state, redirectUri, connectorId, connectorFactoryId, jti };
    await setSession(storage);

    try {
      // eslint-disable-next-line new-cap
      const identityProvider = saml.IdentityProvider({
        wantAuthnRequestsSigned: signAuthnRequest,
        metadata: idpMetadataXml,
      });
      // eslint-disable-next-line new-cap
      const serviceProvider = saml.ServiceProvider({
        entityID,
        relayState: jti,
        nameIDFormat,
        signingCert: x509Certificate,
        authnRequestsSigned: signAuthnRequest,
        requestSignatureAlgorithm,
        privateKey,
        privateKeyPass,
        assertionConsumerService: [
          {
            Location: assertionConsumerServiceUrl,
            Binding: saml.Constants.BindingNamespace.Post,
          },
        ],
      });

      const loginRequest = serviceProvider.createLoginRequest(identityProvider, 'redirect');

      return loginRequest.context;
    } catch (error: unknown) {
      throw new ConnectorError(ConnectorErrorCodes.General, String(error));
    }
  };

export const validateSamlAssertion =
  (getConfig: GetConnectorConfig): ValidateSamlAssertion =>
  async (assertion, getSession, setSession) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig<SamlConfig>(config, samlConfigGuard);
    const parsedConfig = samlConfigGuard.parse(config);

    const connectorSession = await getSession();
    const { connectorFactoryId, redirectUri, state } = connectorSession;

    assert(
      connectorFactoryId && connectorFactoryId === defaultMetadata.id,
      new ConnectorError(ConnectorErrorCodes.General, {
        message:
          'Can not find `connectorFactoryId` from connector session match the fixed metadata id.',
      })
    );

    await samlAssertionHandler(assertion, parsedConfig, setSession);

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

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (_data, getSession) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig<SamlConfig>(config, samlConfigGuard);
    const parsedConfig = samlConfigGuard.parse(config);
    const { profileMap } = parsedConfig;

    assert(
      getSession,
      new ConnectorError(ConnectorErrorCodes.NotImplemented, {
        message: 'Function `getSession()` is not implemented.',
      })
    );
    const { extractedRawProfile } = await getSession();

    const extractedRawProfileGuard = z.record(z.string());
    const rawProfileParseResult = extractedRawProfileGuard.safeParse(extractedRawProfile);

    if (!rawProfileParseResult.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, rawProfileParseResult.error);
    }

    const rawUserProfile = rawProfileParseResult.data;

    return getUserInfoFromRawUserProfile(rawUserProfile, profileMap);
  };

const createSamlConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: samlConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
    validateSamlAssertion: validateSamlAssertion(getConfig),
  };
};

export default createSamlConnector;
