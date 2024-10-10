import { X509Certificate } from 'node:crypto';

import * as validator from '@authenio/samlify-node-xmllint';
import { ssoSamlAssertionContentGuard, type SsoSamlAssertionContent } from '@logto/schemas';
import { type Optional, appendPath, tryThat } from '@silverhand/essentials';
import { conditional } from '@silverhand/essentials';
import { HTTPError, got } from 'got';
import * as saml from 'samlify';
import { z, ZodError } from 'zod';

import { ssoPath } from '#src/routes/interaction/const.js';

import {
  SsoConnectorConfigErrorCodes,
  SsoConnectorError,
  SsoConnectorErrorCodes,
} from '../types/error.js';
import {
  defaultAttributeMapping,
  extendedSocialUserInfoGuard,
  type AttributeMap,
  type ExtendedSocialUserInfo,
  type SamlIdentityProviderMetadata,
  type CustomizableAttributeMap,
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
  };

  // The type inference of the return type of `getX509Certificate` is any, will be guarded by later zod parser if it is not string-typed.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const rawX509Certificate: string = idP.entityMeta.getX509Certificate(
    saml.Constants.wording.certUse.signing
  );

  const certificate = tryThat(
    () => getPemCertificate(rawX509Certificate),
    (error) => {
      throw new SsoConnectorError(SsoConnectorErrorCodes.InvalidCertificate, {
        config: { ...rawSamlMetadata, x509Certificate: rawX509Certificate },
        error,
      });
    }
  );
  const certificateExpiresAt = new Date(certificate.validTo).getTime();

  const payload = {
    ...rawSamlMetadata,
    certificateExpiresAt,
    isCertificateValid: certificateExpiresAt > Date.now(),
    x509Certificate: certificate.toJSON(), // This returns the parsed certificate in string-type.
  };

  // The return type of `samlify`
  const result = samlIdentityProviderMetadataGuard.safeParse(payload);

  if (!result.success) {
    throw new SsoConnectorError(SsoConnectorErrorCodes.InvalidMetadata, {
      message: SsoConnectorConfigErrorCodes.InvalidConnectorConfig,
      metadata: payload,
      error: result.error,
    });
  }

  return result.data;
};

/**
 * Get corresponding IdP's raw SAML metadata (in XML format) from the SAML SSO connector config.
 *
 * @param config The raw SAML SSO connector config.
 * @returns The corresponding IdP's raw SAML metadata (in XML format).
 */
export const fetchSamlMetadataXml = async (metadataUrl: string): Promise<Optional<string>> => {
  try {
    const { body } = await got.get(metadataUrl);

    const result = z.string().safeParse(body);

    if (!result.success) {
      throw new SsoConnectorError(SsoConnectorErrorCodes.InvalidMetadata, {
        message: SsoConnectorConfigErrorCodes.InvalidConfigResponse,
        metadata: body,
        error: result.error,
      });
    }

    return result.data;
  } catch (error: unknown) {
    if (error instanceof SsoConnectorError) {
      throw error;
    }

    throw new SsoConnectorError(SsoConnectorErrorCodes.InvalidMetadata, {
      message: SsoConnectorConfigErrorCodes.FailToFetchConfig,
      error: error instanceof HTTPError ? error.response.body : error,
    });
  }
};

/**
 * Get the user info from the raw user profile extracted from IdP SAML assertion.
 *
 * @param rawUserProfile The raw user profile extracted from IdP SAML assertion.
 * @param attributeMapping The full attribute mapping with default values.
 *
 * @returns The mapped social user info.
 */
export const getExtendedUserInfoFromRawUserProfile = (
  rawUserProfile: Record<string, unknown>,
  attributeMapping: AttributeMap
): ExtendedSocialUserInfo => {
  const keyMap = new Map(
    Object.entries(attributeMapping).map(([destination, source]) => [source, destination])
  );

  const mappedUserProfile = Object.fromEntries(
    Object.entries(rawUserProfile).map(([key, value]) => [keyMap.get(key) ?? key, value])
  );

  const result = extendedSocialUserInfoGuard.safeParse(mappedUserProfile);

  if (!result.success) {
    throw new SsoConnectorError(SsoConnectorErrorCodes.AuthorizationFailed, {
      message: 'Invalid SAML assertion',
      response: mappedUserProfile,
      error: result.error.flatten(),
    });
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
): Promise<SsoSamlAssertionContent> => {
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

    return ssoSamlAssertionContentGuard.parse(assertionResult.extract);
  } catch (error: unknown) {
    throw new SsoConnectorError(SsoConnectorErrorCodes.AuthorizationFailed, {
      message: 'Invalid SAML assertion',
      error: error instanceof ZodError ? error.flatten() : error,
    });
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

const pemCertificatePrefix = '-----BEGIN CERTIFICATE-----';
const pemCertificateSuffix = '-----END CERTIFICATE-----';

const withPemCertificateWrapper = (certificateContent: string) =>
  `${pemCertificatePrefix}\n${certificateContent}\n${pemCertificateSuffix}`;

const isPemCertificateWithWrapper = (certificateContent: string) =>
  certificateContent.startsWith(`${pemCertificatePrefix}\n`) &&
  certificateContent.endsWith(`\n${pemCertificateSuffix}`);

export const getPemCertificate = (certificateContent: string) => {
  const rawCertificate = isPemCertificateWithWrapper(certificateContent)
    ? certificateContent
    : withPemCertificateWrapper(certificateContent);
  return new X509Certificate(rawCertificate);
};
