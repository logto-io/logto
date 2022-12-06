import { Event } from '@logto/schemas';
import type { Provider } from 'oidc-provider';

import type {
  InteractionContext,
  AnonymousInteractionResult,
  IdentifierVerifiedInteractionResult,
} from '../types/index.js';
import identifierPayloadVerification from './identifier-payload-verification.js';
import userIdentityVerification from './user-identity-verification.js';

export default async function verifyIdentifier(
  ctx: InteractionContext,
  provider: Provider,
  interactionRecord?: AnonymousInteractionResult
): Promise<IdentifierVerifiedInteractionResult> {
  const verifiedInteraction = await identifierPayloadVerification(ctx, provider, interactionRecord);

  if (verifiedInteraction.event === Event.Register) {
    return verifiedInteraction;
  }

  return userIdentityVerification(verifiedInteraction, ctx, provider);
}
