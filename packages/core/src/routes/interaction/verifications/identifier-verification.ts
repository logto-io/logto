import { Event } from '@logto/schemas';
import type { Context } from 'koa';
import type { Provider } from 'oidc-provider';

import type {
  RegisterInteractionResult,
  SignInInteractionResult,
  ForgotPasswordInteractionResult,
  AccountVerifiedInteractionResult,
} from '../types/index.js';
import { storeInteractionResult } from '../utils/interaction.js';
import verifyUserAccount from './user-identity-verification.js';

type InteractionResult =
  | RegisterInteractionResult
  | SignInInteractionResult
  | ForgotPasswordInteractionResult;

export default async function verifyIdentifier(
  ctx: Context,
  provider: Provider,
  interactionRecord: InteractionResult
): Promise<RegisterInteractionResult | AccountVerifiedInteractionResult> {
  if (interactionRecord.event === Event.Register) {
    return interactionRecord;
  }

  // Verify the user account and assign the verified result to the interaction record
  const accountVerifiedInteractionResult = await verifyUserAccount(interactionRecord);
  await storeInteractionResult(accountVerifiedInteractionResult, ctx, provider);

  return accountVerifiedInteractionResult;
}
