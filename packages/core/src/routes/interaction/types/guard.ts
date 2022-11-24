import type {
  UsernamePasswordPayload,
  EmailPasscodePayload,
  PhonePasswordPayload,
  EmailPasswordPayload,
  PhonePasscodePayload,
  SocialConnectorPayload,
} from '@logto/schemas';
import {
  eventGuard,
  profileGuard,
  identifierGuard,
  usernamePasswordPayloadGuard,
  emailPasswordPayloadGuard,
  phonePasswordPayloadGuard,
  emailPasscodePayloadGuard,
  phonePasscodePayloadGuard,
  socialConnectorPayloadGuard,
} from '@logto/schemas';
import { z } from 'zod';

export const interactionPayloadGuard = z.object({
  event: eventGuard.optional(),
  identifier: identifierGuard.optional(),
  profile: profileGuard.optional(),
});

export type InteractionPayload = z.infer<typeof interactionPayloadGuard>;

export const isUsernamePassword = (
  identifier: InteractionPayload['identifier']
): identifier is UsernamePasswordPayload =>
  usernamePasswordPayloadGuard.safeParse(identifier).success;

export const isEmailPassword = (
  identifier: InteractionPayload['identifier']
): identifier is EmailPasswordPayload => emailPasswordPayloadGuard.safeParse(identifier).success;

export const isPhonePassword = (
  identifier: InteractionPayload['identifier']
): identifier is PhonePasswordPayload => phonePasswordPayloadGuard.safeParse(identifier).success;

export const isEmailPasscode = (
  identifier: InteractionPayload['identifier']
): identifier is EmailPasscodePayload => emailPasscodePayloadGuard.safeParse(identifier).success;

export const isPhonePasscode = (
  identifier: InteractionPayload['identifier']
): identifier is PhonePasscodePayload => phonePasscodePayloadGuard.safeParse(identifier).success;

export const isSocialConnector = (
  identifier: InteractionPayload['identifier']
): identifier is SocialConnectorPayload =>
  socialConnectorPayloadGuard.safeParse(identifier).success;
