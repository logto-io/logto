import {
  BindingType,
  type PatchSamlApplication,
  type SamlApplicationResponse,
} from '@logto/schemas';
import { removeUndefinedKeys } from '@silverhand/essentials';

import { type SamlApplicationFormData } from './Settings';

export const parseSamlApplicationResponseToFormData = (
  data: SamlApplicationResponse
): SamlApplicationFormData => {
  const { id, description, name, entityId, acsUrl } = data;

  return {
    id,
    description,
    name,
    entityId,
    acsUrl: acsUrl?.url ?? null,
  };
};

export const parseFormDataToSamlApplicationRequest = (
  data: SamlApplicationFormData
): {
  id: string;
  payload: PatchSamlApplication;
} => {
  const { id, description, name, entityId, acsUrl } = data;

  // If acsUrl value is empty string, it should be removed. Convert it to null.
  const acsUrlData = acsUrl ? { url: acsUrl, binding: BindingType.Post } : null;

  return {
    id,
    payload: removeUndefinedKeys({
      description,
      name,
      entityId,
      acsUrl: acsUrlData,
    }),
  };
};

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
