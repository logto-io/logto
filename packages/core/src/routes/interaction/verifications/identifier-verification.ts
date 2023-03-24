import { InteractionEvent } from '@logto/schemas';
import type { Context } from 'koa';

import type TenantContext from '#src/tenants/TenantContext.js';

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
  tenant: TenantContext,
  interactionRecord: InteractionResult
): Promise<RegisterInteractionResult | AccountVerifiedInteractionResult> {
  if (interactionRecord.event === InteractionEvent.Register) {
    return interactionRecord;
  }

  // Verify the user account and assign the verified result to the interaction record
  const accountVerifiedInteractionResult = await verifyUserAccount(tenant, interactionRecord);
  await storeInteractionResult(accountVerifiedInteractionResult, ctx, tenant.provider);

  return accountVerifiedInteractionResult;
}
