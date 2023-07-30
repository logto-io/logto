import {
  connectorMetadataGuard,
  type ConnectorMetadata,
  ConnectorType,
} from '@logto/connector-kit';
import { type SignInExperience, SignInExperiences } from '@logto/schemas';
import { z } from 'zod';

type ForgotPassword = {
  phone: boolean;
  email: boolean;
};

export type ConnectorMetadataWithId = ConnectorMetadata & { id: string; type: ConnectorType };

export type FullSignInExperience = SignInExperience & {
  connectors: ConnectorMetadataWithId[];
  forgotPassword: ForgotPassword;
};

export const guardFullSignInExperience: z.ZodType<FullSignInExperience> =
  SignInExperiences.guard.extend({
    connectors: connectorMetadataGuard
      .extend({ id: z.string(), type: z.nativeEnum(ConnectorType) })
      .array(),
    forgotPassword: z.object({ phone: z.boolean(), email: z.boolean() }),
  });
