import {
  BindingType,
  isSamlForceAuthnEnabled,
  type PatchSamlApplication,
  type SamlApplicationResponse,
  type SamlStaticAttributes,
  samlStaticAttributesGuard,
} from '@logto/schemas';
import { cond, removeUndefinedKeys } from '@silverhand/essentials';

import { type SamlApplicationFormData } from './Settings';

export const parseSamlApplicationResponseToFormData = (
  data: SamlApplicationResponse
): SamlApplicationFormData => {
  const { id, description, name, entityId, acsUrl, encryption, nameIdFormat, authnRequestConfig } =
    data;

  return {
    id,
    description,
    name,
    entityId,
    acsUrl: acsUrl?.url ?? null,
    nameIdFormat,
    encryptSamlAssertion: encryption?.encryptAssertion ?? false,
    encryptThenSignSamlAssertion: encryption?.encryptThenSign ?? false,
    certificate: encryption?.certificate ?? '',
    forceAuthn: isSamlForceAuthnEnabled(authnRequestConfig),
  };
};

export const parseFormDataToSamlApplicationRequest = (
  data: SamlApplicationFormData,
  /** PATCH replaces `authnRequestConfig`, so settings the form does not edit are carried over. */
  authnRequestConfig: SamlApplicationResponse['authnRequestConfig']
): {
  id: string;
  payload: PatchSamlApplication;
} => {
  const {
    id,
    description,
    name,
    entityId,
    acsUrl,
    encryptSamlAssertion,
    encryptThenSignSamlAssertion,
    certificate,
    nameIdFormat,
    forceAuthn,
  } = data;

  // If acsUrl value is empty string, it should be removed. Convert it to null.
  const acsUrlData = acsUrl ? { url: acsUrl, binding: BindingType.Post } : null;

  return {
    id,
    payload: removeUndefinedKeys({
      description,
      name,
      entityId,
      acsUrl: acsUrlData,
      nameIdFormat,
      authnRequestConfig: { ...authnRequestConfig, forceAuthn },
      ...cond(
        encryptSamlAssertion
          ? cond(
              certificate && {
                encryption: {
                  encryptAssertion: encryptSamlAssertion,
                  certificate,
                  encryptThenSign: encryptThenSignSamlAssertion,
                },
              }
            )
          : {
              encryption: null,
            }
      ),
    }),
  };
};

export type StaticAttributeFormRow = {
  key: string;
  value: string;
};

export const parseStaticAttributesToFormData = (
  staticAttributes: SamlStaticAttributes
): StaticAttributeFormRow[] => {
  const rows = Object.entries(staticAttributes).map(([key, value]) => ({ key, value }));
  return rows.length > 0 ? rows : [{ key: '', value: '' }];
};

export const parseFormDataToStaticAttributes = (
  rows: StaticAttributeFormRow[]
): SamlStaticAttributes =>
  Object.fromEntries(
    rows.filter(({ key, value }) => key || value).map(({ key, value }) => [key, value])
  );

type StaticAttributeError =
  | 'key_missing_error'
  | 'key_duplicated_error'
  | 'invalid_key_error'
  | 'value_missing_error';

export const getStaticAttributeKeyError = (
  rows: StaticAttributeFormRow[],
  index: number
): StaticAttributeError | undefined => {
  const { key = '', value = '' } = rows[index] ?? {};

  if (!key) {
    return value ? 'key_missing_error' : undefined;
  }

  if (rows.filter((row) => row.key === key).length > 1) {
    return 'key_duplicated_error';
  }

  return samlStaticAttributesGuard.keySchema.safeParse(key).success
    ? undefined
    : 'invalid_key_error';
};

export const getStaticAttributeValueError = (
  rows: StaticAttributeFormRow[],
  index: number
): StaticAttributeError | undefined =>
  rows[index]?.key && !rows[index]?.value ? 'value_missing_error' : undefined;

export const buildSamlSigningCertificateFilename = (appId: string, id: string) =>
  `${appId}-saml-certificate-${id}`;

export const samlApplicationManagementApiPrefix = '/api/saml-applications';
export const samlApplicationEndpointPrefix = '/saml';
export const samlApplicationMetadataEndpointSuffix = 'metadata';
export const samlApplicationSingleSignOnEndpointSuffix = 'authn';

export const camelCaseToSentenceCase = (input: string): string => {
  const words = input.split('_');

  // If the first word is empty, return an empty string.
  if (!words[0]) {
    return '';
  }

  const capitalizedFirstWord = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return [capitalizedFirstWord, ...words.slice(1)].join(' ');
};

export const validateCertificate = (certificate: string) => {
  // Remove any whitespace and newline characters for consistent validation
  const normalizedCert = certificate.replaceAll(/\s/g, '');

  // Check if the certificate starts with the header and ends with the footer
  if (
    !normalizedCert.startsWith('-----BEGINCERTIFICATE-----') ||
    !normalizedCert.endsWith('-----ENDCERTIFICATE-----')
  ) {
    return false;
  }

  // Extract the base64 content between the header and footer
  const base64Content = normalizedCert
    .replace('-----BEGINCERTIFICATE-----', '')
    .replace('-----ENDCERTIFICATE-----', '');

  // Check if the content is valid base64
  try {
    if (base64Content.length % 4 !== 0) {
      return false;
    }
    if (!/^[\d+/A-Za-z]*={0,2}$/.test(base64Content)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};
