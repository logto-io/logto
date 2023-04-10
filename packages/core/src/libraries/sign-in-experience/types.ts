import { connectorMetadataGuard, type ConnectorMetadata } from '@logto/connector-kit';
import { type SignInExperience, SignInExperiences } from '@logto/schemas';
import { z } from 'zod';

export type ForgotPassword = {
  phone: boolean;
  email: boolean;
};

export type ConnectorMetadataWithId = ConnectorMetadata & { id: string };

export type FullSignInExperience = SignInExperience & {
  socialConnectors: ConnectorMetadataWithId[];
  forgotPassword: ForgotPassword;
};

export const guardFullSignInExperience: z.ZodType<FullSignInExperience> =
  SignInExperiences.guard.extend({
    socialConnectors: connectorMetadataGuard.extend({ id: z.string() }).array(),
    forgotPassword: z.object({ phone: z.boolean(), email: z.boolean() }),
  });
