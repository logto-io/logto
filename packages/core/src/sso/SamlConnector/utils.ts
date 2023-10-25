import {
  ConnectorError,
  ConnectorErrorCodes,
  socialUserInfoGuard,
  type SetSession,
} from '@logto/connector-kit';
import { XMLValidator } from 'fast-xml-parser';
import { got } from 'got';
import * as saml from 'samlify';
import { z } from 'zod';

import {
  samlMetadataGuard,
  type SamlMetadata,
  type BaseSamlConnectorConfig,
  type ProfileMap,
  MetadataType,
  type BaseSamlConfig,
} from '../types/saml.js';

type ESamlHttpRequest = Parameters<saml.ServiceProviderInstance['parseLoginResponse']>[2];

const xmlValidator = (xml: string) => {
  try {
    XMLValidator.validate(xml, {
      allowBooleanAttributes: true,
    });
  } catch (error: unknown) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, error);
  }
};

const parseXmlMetadata = (xml: string): SamlMetadata => {
  xmlValidator(xml);

  // eslint-disable-next-line new-cap
  const idP = saml.IdentityProvider({ metadata: xml });

  const rawSingleSignOnService = idP.entityMeta.getSingleSignOnService(
    saml.Constants.namespace.binding.redirect
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const singleSignOnService =
    typeof rawSingleSignOnService === 'string'
      ? rawSingleSignOnService
      : Object.entries(rawSingleSignOnService).find(
          ([key, value]) => key === saml.Constants.namespace.binding.redirect
        )?.[1];
  const rawSamlMetadata = {
    entityId: idP.entityMeta.getEntityID(),
    /**
     * See implementation in `samlify` {@link https://github.com/tngan/samlify/blob/55f845da60b18d40668885c7f7e71ed0967ef67f/src/entity.ts#L88}.
     */
    nameIdFormat: idP.entitySetting.nameIDFormat,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    signInEndpoint: singleSignOnService,
    signingAlgorithm: idP.entitySetting.requestSignatureAlgorithm,
    // The type inference of the return type of `getX509Certificate` is any, will be guarded by later zod parser if it is not string-typed.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    x509Certificate: idP.entityMeta.getX509Certificate(saml.Constants.wording.certUse.signing),
  };

  // The return type of `samlify`
  const result = samlMetadataGuard.safeParse(rawSamlMetadata);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
  }

  return result.data;
};

export const getRawSamlConfig = async (config: BaseSamlConnectorConfig): Promise<string> => {
  if (config.metadataType === MetadataType.URL) {
    const { body } = await got.get(config.metadataUrl);

    const result = z.string().safeParse(body);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }

    return result.data;
  }

  return config.metadataXml;
};

export const fetchSamlConfig = async (config: BaseSamlConnectorConfig) => {
  const rawMetadata = await getRawSamlConfig(config);
  return parseXmlMetadata(rawMetadata);
};

export const getUserInfoFromRawUserProfile = (
  rawUserProfile: Record<string, unknown>,
  keyMapping: ProfileMap
) => {
  const keyMap = new Map(
    Object.entries(keyMapping).map(([destination, source]) => [source, destination])
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const mappedUserProfile = Object.fromEntries(
    Object.entries(rawUserProfile)
      .filter(([key, value]) => keyMap.get(key) && value)
      .map(([key, value]) => [keyMap.get(key), value])
  );

  const result = socialUserInfoGuard.safeParse(mappedUserProfile);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
  }

  return result.data;
};

export const samlAssertionHandler = async (
  request: ESamlHttpRequest,
  options: BaseSamlConfig & { idpMetadataXml: string },
  setSession: SetSession
): Promise<void | Record<string, unknown>> => {
  const { entityId: entityID, x509Certificate, idpMetadataXml } = options;
  // eslint-disable-next-line new-cap
  const identityProvider = saml.IdentityProvider({
    metadata: idpMetadataXml,
  });
  // eslint-disable-next-line new-cap
  const serviceProvider = saml.ServiceProvider({
    entityID,
    signingCert: x509Certificate,
  });

  // Used to check whether xml content is valid in format.
  saml.setSchemaValidator({
    validate: async (xmlContent: string) => {
      try {
        XMLValidator.validate(xmlContent, {
          allowBooleanAttributes: true,
        });

        return true;
      } catch {
        return false;
      }
    },
  });

  try {
    const assertionResult = await serviceProvider.parseLoginResponse(
      identityProvider,
      'post',
      request
    );

    await setSession({
      extractedRawProfile: {
        ...(Boolean(assertionResult.extract.nameID) && {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          id: assertionResult.extract.nameID,
        }),
        ...assertionResult.extract.attributes,
      },
    });
  } catch (error: unknown) {
    throw new ConnectorError(ConnectorErrorCodes.General, String(error));
  }
};
