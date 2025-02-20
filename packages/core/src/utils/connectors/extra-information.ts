import { type ConnectorMetadata, ServiceConnector } from '@logto/connector-kit';
import {
  type User,
  type Organization,
  type ApplicationSignInExperience,
  type Application,
} from '@logto/schemas';
import { conditional, type Nullable, pick } from '@silverhand/essentials';
import cleanDeep from 'clean-deep';
import { string, object } from 'zod';

import {
  type ApplicationContextInfo,
  type OrganizationContextInfo,
  type UserContextInfo,
} from './types.js';

const getFromEmailFromMetadata = (metadata: ConnectorMetadata) => {
  const result = object({ fromEmail: string() }).safeParse(metadata);
  return conditional(result.success && result.data.fromEmail);
};

// Will accept other source of `extraInfo` in the future.
export const buildExtraInfo = (metadata: ConnectorMetadata) => {
  const fromEmail = getFromEmailFromMetadata(metadata);
  const extraInfo = {
    ...conditional(fromEmail && metadata.id === ServiceConnector.Email && { fromEmail }),
  };
  return cleanDeep(extraInfo, { emptyObjects: false });
};

export const buildOrganizationContextInfo = (organization: Organization): OrganizationContextInfo =>
  pick(organization, 'id', 'name', 'branding');

export const buildUserContextInfo = (user: User): UserContextInfo =>
  pick(user, 'id', 'avatar', 'name', 'primaryEmail', 'primaryPhone', 'username', 'profile');

export const buildApplicationContextInfo = (
  application: Application,
  applicationSignInExperience?: Nullable<ApplicationSignInExperience>
): ApplicationContextInfo => {
  const { id, name } = application;
  const { branding, displayName } = applicationSignInExperience ?? {};

  return {
    id,
    name,
    ...conditional(branding && { branding }),
    ...conditional(displayName && { displayName }),
  };
};
