// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable complexity */
import { assert, conditional } from '@silverhand/essentials';

import type {
  GetAuthorizationUri,
  GetUserInfo,
  SocialConnector,
  CreateConnector,
  GetConnectorConfig,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
  jsonGuard,
} from '@logto/connector-kit';
import { constructAuthorizationUri } from '@logto/connector-oauth';
import { generateStandardId } from '@logto/shared/universal';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { HTTPError } from 'ky';

import { defaultMetadata } from './constant.js';
import { myGovIdTokenProfileStandardClaimsGuard, oidcConnectorConfigGuard } from './types.js';
import { getIdToken } from './utils.js';

const generateNonce = () => generateStandardId();

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ state, redirectUri }, setSession) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, oidcConnectorConfigGuard);
    const parsedConfig = oidcConnectorConfigGuard.parse(config);

    const nonce = generateNonce();

    assert(
      setSession,
      new ConnectorError(ConnectorErrorCodes.NotImplemented, {
        message: 'Function `setSession()` is not implemented',
      })
    );
    await setSession({ nonce, redirectUri });

    const {
      authorizationEndpoint,
      responseType,
      clientId,
      scope,
      customConfig,
      authRequestOptionalConfig,
    } = parsedConfig;

    return constructAuthorizationUri(authorizationEndpoint, {
      responseType,
      clientId,
      scope,
      redirectUri,
      state,
      nonce,
      ...authRequestOptionalConfig,
      ...customConfig,
    });
  };

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data, getSession) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, oidcConnectorConfigGuard);
    const parsedConfig = oidcConnectorConfigGuard.parse(config);

    assert(
      getSession,
      new ConnectorError(ConnectorErrorCodes.NotImplemented, {
        message: 'Function `getSession()` is not implemented.',
      })
    );
    const { nonce: validationNonce, redirectUri } = await getSession();

    assert(
      redirectUri,
      new ConnectorError(ConnectorErrorCodes.General, {
        message: "CAN NOT find 'redirectUri' from connector session.",
      })
    );

    const { id_token: idToken } = await getIdToken(parsedConfig, data, redirectUri);

    if (!idToken) {
      throw new ConnectorError(ConnectorErrorCodes.SocialIdTokenInvalid, {
        message: 'Cannot find ID Token.',
      });
    }

    try {
      const { payload } = await jwtVerify(
        idToken,
        createRemoteJWKSet(new URL(parsedConfig.idTokenVerificationConfig.jwksUri)),
        {
          ...parsedConfig.idTokenVerificationConfig,
          audience: parsedConfig.clientId,
        }
      );

      const result = myGovIdTokenProfileStandardClaimsGuard.safeParse(payload);

      if (!result.success) {
        throw new ConnectorError(ConnectorErrorCodes.SocialIdTokenInvalid, result.error);
      }

      const {
        sub: id,
        firstName,
        lastName,
        email,
        mobile,
        nonce,
        surname,
        givenName,
      } = result.data;

      if (nonce) {
        // TODO @darcy: need to specify error code
        assert(
          validationNonce,
          new ConnectorError(ConnectorErrorCodes.General, {
            message: 'Cannot find `nonce` in session storage.',
          })
        );

        assert(
          validationNonce === nonce,
          new ConnectorError(ConnectorErrorCodes.SocialIdTokenInvalid, {
            message: 'ID Token validation failed due to `nonce` mismatch.',
          })
        );
      }

      // TODO: Understand how to fill customData here
      // await setCustomData({ ...customDataNeededFromResult })
      const toConcatName = firstName && firstName.length > 0 ? firstName : givenName;
      const toConcatSurname = lastName && lastName.length > 0 ? lastName : surname;
      const concatenated = [toConcatName, toConcatSurname].join(' ').trim();
      const name = concatenated.length > 0 ? concatenated : 'Name not found';
      return {
        id,
        name,
        avatar: undefined,
        email: conditional(email),
        phone: mobile ?? undefined, // Convert null to undefined
        rawData: jsonGuard.parse(payload),
      };
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(error.response.body));
      }

      throw error;
    }
  };

const createOidcConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: oidcConnectorConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createOidcConnector;
