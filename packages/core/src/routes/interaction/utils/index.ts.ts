import type { Profile, SocialConnectorPayload } from '@logto/schemas';

import type {
  PasscodeIdentifierPayload,
  IdentifierPayload,
  PasswordIdentifierPayload,
} from '../types/guard.js';

export const isPasswordIdentifier = (
  identifier: IdentifierPayload
): identifier is PasswordIdentifierPayload => 'password' in identifier;

export const isPasscodeIdentifier = (
  identifier: IdentifierPayload
): identifier is PasscodeIdentifierPayload => 'passcode' in identifier;

export const isProfileIdentifier = (
  identifier: PasscodeIdentifierPayload | SocialConnectorPayload,
  profile?: Profile
) => {
  if ('email' in identifier) {
    return profile?.email === identifier.email;
  }

  if ('phone' in identifier) {
    return profile?.phone === identifier.phone;
  }

  return profile?.connectorId === identifier.connectorId;
};
