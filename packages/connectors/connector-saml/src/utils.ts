import {
  ConnectorError,
  ConnectorErrorCodes,
  socialUserInfoGuard,
  connectorDataParser,
} from '@logto/connector-kit';
import type { SetSession, SocialUserInfo } from '@logto/connector-kit';
import { XMLValidator } from 'fast-xml-parser';
import * as saml from 'samlify';

import type { ESamlHttpRequest, ProfileMap, SamlConfig } from './types.js';

export const userProfileMapping = (
  originUserProfile: Record<string, unknown>,
  keyMapping: ProfileMap
) => {
  const keyMap = new Map(
    Object.entries(keyMapping).map(([destination, source]) => [source, destination])
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const mappedUserProfile = Object.fromEntries(
    Object.entries(originUserProfile)
      .filter(([key, value]) => keyMap.get(key) && value)
      .map(([key, value]) => [keyMap.get(key), value])
  );

  return connectorDataParser<SocialUserInfo>(mappedUserProfile, socialUserInfoGuard);
};

export const getUserInfoFromRawUserProfile = (
  rawUserProfile: Record<string, unknown>,
  keyMapping: ProfileMap
) => {
  const userProfile = userProfileMapping(rawUserProfile, keyMapping);
  return connectorDataParser<SocialUserInfo>(
    userProfile,
    socialUserInfoGuard,
    ConnectorErrorCodes.General
  );
};

export const samlAssertionHandler = async (
  request: ESamlHttpRequest,
  options: SamlConfig,
  setSession: SetSession
): Promise<void | Record<string, unknown>> => {
  const {
    entityID,
    x509Certificate,
    idpMetadataXml,
    encryptAssertion,
    encPrivateKey,
    encPrivateKeyPass,
    messageSigningOrder,
    timeout,
  } = options;
  // eslint-disable-next-line new-cap
  const identityProvider = saml.IdentityProvider({
    metadata: idpMetadataXml,
    messageSigningOrder,
    isAssertionEncrypted: encryptAssertion,
  });
  // eslint-disable-next-line new-cap
  const serviceProvider = saml.ServiceProvider({
    entityID,
    signingCert: x509Certificate,
    isAssertionEncrypted: encryptAssertion,
    encPrivateKey,
    encPrivateKeyPass,
    clockDrifts: [-timeout, timeout],
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
    throw new ConnectorError(ConnectorErrorCodes.General, { data: error });
  }
};
