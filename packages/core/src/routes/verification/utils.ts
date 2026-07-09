import { SignInIdentifier, type VerificationCodeIdentifier } from '@logto/schemas';

import { validateEmailAgainstAccessPolicy } from '#src/libraries/sign-in-experience/email-blocklist-policy.js';
import type Queries from '#src/tenants/Queries.js';

export const guardNewIdentifierEmailBlocklist = async (
  queries: Queries,
  identifier: VerificationCodeIdentifier,
  isNewIdentifier: boolean
) => {
  if (!isNewIdentifier || identifier.type !== SignInIdentifier.Email) {
    return;
  }

  const { emailAllowlistPolicy, emailBlocklistPolicy } =
    await queries.signInExperiences.findDefaultSignInExperience();
  await validateEmailAgainstAccessPolicy(
    emailAllowlistPolicy,
    emailBlocklistPolicy,
    identifier.value
  );
};
