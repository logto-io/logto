import { connectorMetadataGuard, type ConnectorMetadata } from '@logto/connector-kit';
import {
  type SignInExperience,
  SignInExperiences,
  type SsoConnectorMetadata,
  ssoConnectorMetadataGuard,
} from '@logto/schemas';
import { z } from 'zod';

type ForgotPassword = {
  phone: boolean;
  email: boolean;
};

type ConnectorMetadataWithId = ConnectorMetadata & { id: string };

export type FullSignInExperience = SignInExperience & {
  socialConnectors: ConnectorMetadataWithId[];
  ssoConnectors: SsoConnectorMetadata[];
  forgotPassword: ForgotPassword;
  isDevelopmentTenant: boolean;
};

export const guardFullSignInExperience: z.ZodType<FullSignInExperience> =
  SignInExperiences.guard.extend({
    socialConnectors: connectorMetadataGuard.extend({ id: z.string() }).array(),
    ssoConnectors: ssoConnectorMetadataGuard.array(),
    forgotPassword: z.object({ phone: z.boolean(), email: z.boolean() }),
    isDevelopmentTenant: z.boolean(),
  });
