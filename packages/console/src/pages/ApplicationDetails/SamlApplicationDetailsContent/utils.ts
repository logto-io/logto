import {
  BindingType,
  type PatchSamlApplication,
  type SamlApplicationResponse,
} from '@logto/schemas';
import { type Nullable, removeUndefinedKeys } from '@silverhand/essentials';

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
    acsUrl: acsUrl?.url,
  };
};

const buildSamlConfig = ({
  entityId,
  acsUrl,
}: {
  entityId: Nullable<string | undefined>;
  acsUrl: Nullable<string | undefined>;
}): PatchSamlApplication['config'] => {
  if (!entityId && !acsUrl) {
    return;
  }

  return removeUndefinedKeys({
    entityId: entityId ?? undefined,
    // Currently, we only support HTTP-POST binding
    acsUrl: acsUrl ? { url: acsUrl, binding: BindingType.Post } : undefined,
  });
};

export const parseFormDataToSamlApplicationRequest = (
  data: SamlApplicationFormData
): {
  id: string;
  payload: PatchSamlApplication;
} => {
  const { id, description, name, entityId, acsUrl } = data;

  const config = buildSamlConfig({ entityId, acsUrl });

  return {
    id,
    payload: removeUndefinedKeys({
      description,
      name,
      config,
    }),
  };
};

export const samlApplicationManagementApiPrefix = '/api/saml-applications';
export const samlApplicationEndpointPrefix = '/saml';
export const samlApplicationMetadataEndpointSuffix = 'metadata';
export const samlApplicationSingleSignOnEndpointSuffix = 'authn';
