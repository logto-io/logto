import { MfaPolicy } from '@logto/schemas';

export const isNonSkippableMfaPromptPolicy = (policy: MfaPolicy): boolean =>
  [MfaPolicy.PromptAtSignInAndSignUpMandatory, MfaPolicy.PromptOnlyAtSignInMandatory].includes(
    policy
  );

export const isNoSkipMfaPolicy = (policy: MfaPolicy): boolean =>
  [
    MfaPolicy.Mandatory,
    MfaPolicy.PromptAtSignInAndSignUpMandatory,
    MfaPolicy.PromptOnlyAtSignInMandatory,
  ].includes(policy);

export const isPromptOnlyAtSignInPolicy = (policy: MfaPolicy): boolean =>
  [MfaPolicy.PromptOnlyAtSignIn, MfaPolicy.PromptOnlyAtSignInMandatory].includes(policy);

export const normalizeRequiredMfaPolicy = (policy: MfaPolicy): MfaPolicy =>
  policy === MfaPolicy.Mandatory ? MfaPolicy.PromptAtSignInAndSignUpMandatory : policy;

export const legacyizeRequiredMfaPolicy = (policy: MfaPolicy): MfaPolicy =>
  isNonSkippableMfaPromptPolicy(policy) ? MfaPolicy.Mandatory : policy;
