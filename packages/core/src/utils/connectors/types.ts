import type { AllConnector } from '@logto/connector-kit';
import {
  type Application,
  type ApplicationSignInExperience,
  type Connector,
  Connectors,
  type Organization,
  type User,
} from '@logto/schemas';
import { type z } from 'zod';

export { ConnectorType } from '@logto/schemas';

/**
 * The connector type with full context.
 */
export type LogtoConnector<T extends AllConnector = AllConnector> = T & {
  validateConfig: (config: unknown) => void;
} & { dbEntry: Connector };

export const connectorWellKnownGuard = Connectors.guard.pick({
  id: true,
  metadata: true,
  connectorId: true,
});
export type ConnectorWellKnown = z.infer<typeof connectorWellKnownGuard>;

/**
 * The connector type with full context but no sensitive info.
 */
export type LogtoConnectorWellKnown<T extends AllConnector = AllConnector> = Pick<
  T,
  'type' | 'metadata'
> & {
  dbEntry: ConnectorWellKnown;
};

/**
 * Public organization context info for message template payload.
 */
export type OrganizationContextInfo = Pick<Organization, 'id' | 'name' | 'branding'>;
/**
 * Public user context info for message template payload.
 */
export type UserContextInfo = Pick<
  User,
  'id' | 'avatar' | 'name' | 'primaryEmail' | 'primaryPhone' | 'username' | 'profile'
>;
/**
 * Public application context info for message template payload.
 */
export type ApplicationContextInfo = Pick<Application, 'id' | 'name'> &
  Partial<Pick<ApplicationSignInExperience, 'branding' | 'displayName'>>;

/**
 * The context info for organization invitation message template payload.
 */
export type OrganizationInvitationContextInfo = {
  organization?: OrganizationContextInfo;
  inviter?: UserContextInfo;
};
/**
 * The context info for verification code message template payload.
 */
export type VerificationCodeContextInfo = {
  user?: UserContextInfo;
  organization?: OrganizationContextInfo;
  application?: ApplicationContextInfo;
};
