import { type ConnectorMetadata, ServiceConnector } from '@logto/connector-kit';
import { type Organization } from '@logto/schemas';
import { conditional, pick } from '@silverhand/essentials';
import cleanDeep from 'clean-deep';
import { string, object } from 'zod';

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

export type OrganizationExtraInfo = Pick<Organization, 'id' | 'name' | 'branding'>;

export const buildOrganizationExtraInfo = (organization: Organization): OrganizationExtraInfo =>
  pick(organization, 'id', 'name', 'branding');
