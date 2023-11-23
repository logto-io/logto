import * as validator from '@authenio/samlify-node-xmllint';
import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { type Optional, conditional, appendPath } from '@silverhand/essentials';
import { got } from 'got';
import * as saml from 'samlify';
import { z } from 'zod';

import { ssoPath } from '#src/routes/interaction/const.js';

import {
  type SamlConnectorConfig,
  defaultAttributeMapping,
  type CustomizableAttributeMap,
  type AttributeMap,
  extendedSocialUserInfoGuard,
  type ExtendedSocialUserInfo,
  type SamlIdentityProviderMetadata,
  samlIdentityProviderMetadataGuard,
} from '../types/saml.js';

type ESamlHttpRequest = Parameters<saml.ServiceProviderInstance['parseLoginResponse']>[2];

/**
 * Return the parsed SAML metadata using SAML identity provider initiated with SAML metadata.
 *
 * @param idP SAML identity provider instance.
 *
 * @returns The parsed SAML IdP metadata.
 */
export const parseXmlMetadata = (
  idP: saml.IdentityProviderInstance
): SamlIdentityProviderMetadata => {
  // Used to check whether xml content is valid in format.
  saml.setSchemaValidator(validator);

  const rawSingleSignOnService = idP.entityMeta.getSingleSignOnService(
    saml.Constants.namespace.binding.redirect
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const singleSignOnService =
    typeof rawSingleSignOnService === 'string'
      ? rawSingleSignOnService
      : Object.entries(rawSingleSignOnService).find(
          ([key, _]) => key === saml.Constants.namespace.binding.redirect
        )?.[1];

  const rawSamlMetadata = {
    entityId: idP.entityMeta.getEntityID(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    signInEndpoint: singleSignOnService,
    // The type inference of the return type of `getX509Certificate` is any, will be guarded by later zod parser if it is not string-typed.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    x509Certificate: idP.entityMeta.getX509Certificate(saml.Constants.wording.certUse.signing),
  };

  // The return type of `samlify`
  const result = samlIdentityProviderMetadataGuard.safeParse(rawSamlMetadata);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
  }

  return result.data;
};

/**
 * Get corresponding IdP's raw SAML metadata (in XML format) from the SAML SSO connector config.
 *
 * @param config The raw SAML SSO connector config.
 * @returns The corresponding IdP's raw SAML metadata (in XML format).
 */
export const getSamlMetadataXml = async (
  config: SamlConnectorConfig
): Promise<Optional<string>> => {
  const { metadata, metadataUrl } = config;
  if (metadataUrl) {
    try {
      const { body } = await got.get(metadataUrl);

      const result = z.string().safeParse(body);

      if (!result.success) {
        throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
      }

      return result.data;
    } catch (error: unknown) {
      // HTTP request error
      throw new ConnectorError(ConnectorErrorCodes.General, error);
    }
  }

  return metadata;
};

/**
 * Get the user info from the raw user profile extracted from IdP SAML assertion.
 *
 * @param rawUserProfile The raw user profile extracted from IdP SAML assertion.
 * @param keyMapping The full attribute mapping with default values.
 * @returns The mapped social user info.
 */
export const getExtendedUserInfoFromRawUserProfile = (
  rawUserProfile: Record<string, unknown>,
  keyMapping: AttributeMap
): ExtendedSocialUserInfo => {
  const keyMap = new Map(
    Object.entries(keyMapping).map(([destination, source]) => [source, destination])
  );

  const mappedUserProfile = Object.fromEntries(
    Object.entries(rawUserProfile).map(([key, value]) => [keyMap.get(key) ?? key, value])
  );

  const result = extendedSocialUserInfoGuard.safeParse(mappedUserProfile);

  if (!result.success) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidResponse, result.error);
  }

  return result.data;
};

/**
 * Handle the SAML assertion from the identity provider.
 *
 * @param request The SAML assertion sent by IdP (after getting the SAML auth request).
 * @param identityProvider The SAML identity provider instance (where we can get parsed IdP metadata).
 * @param metadata The selected part of metadata of the SAML SSO connector.
 * @returns The returned info contained in the SAML assertion.
 */
export const handleSamlAssertion = async (
  request: ESamlHttpRequest,
  identityProvider: saml.IdentityProviderInstance,
  metadata: { entityId: string; x509Certificate: string }
): Promise<Record<string, unknown>> => {
  const { entityId: entityID, x509Certificate } = metadata;

  // eslint-disable-next-line new-cap
  const serviceProvider = saml.ServiceProvider({
    entityID,
    signingCert: x509Certificate,
  });

  // Used to check whether xml content is valid in format.
  saml.setSchemaValidator(validator);

  try {
    const assertionResult = await serviceProvider.parseLoginResponse(
      identityProvider,
      'post',
      request
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
      ...(Boolean(assertionResult.extract.nameID) && {
        id: assertionResult.extract.nameID,
      }),
      ...assertionResult.extract.attributes,
    };
  } catch (error: unknown) {
    throw new ConnectorError(ConnectorErrorCodes.General, String(error));
  }
};

/**
 * Get the full attribute mapping using specified attribute mappings with default fallback values.
 *
 * @param attributeMapping Specified attribute mapping stored in database.
 * @returns Full attribute mapping with default values.
 */
export const attributeMappingPostProcessor = (
  attributeMapping?: CustomizableAttributeMap
): AttributeMap => {
  return {
    ...defaultAttributeMapping,
    ...conditional(attributeMapping && attributeMapping),
  };
};

/**
 * Generate the entity id for the current SAML SSO connector using tenant endpoint path and connector id.
 * Used URL-like entity id here since some identity providers will check the format of the entity id.
 * See {@link https://spaces.at.internet2.edu/display/federation/saml-metadata-entityid} to know more details about how should `entityId` look like.
 *
 * @param baseUrl Base endpoint for the current service
 * @param connectorId Current connector id.
 *
 * @returns Entity id for the current SAML SSO connector.
 */
export const buildSpEntityId = (baseUrl: URL, connectorId: string) => {
  return appendPath(baseUrl, `/enterprise-sso/${connectorId}`).toString();
};

/**
 * Generate the assertion consumer service url for the current SAML SSO connector using current base url and connector id.
 *
 * @param baseUrl Base endpoint for the current service
 * @param ssoConnectorId Current enterprise SSO connector id
 * @returns
 */
export const buildAssertionConsumerServiceUrl = (baseUrl: URL, ssoConnectorId: string) =>
  appendPath(baseUrl, `api/authn/${ssoPath}/saml/${ssoConnectorId}`).toString();
