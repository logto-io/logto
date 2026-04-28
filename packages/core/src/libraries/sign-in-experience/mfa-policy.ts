import { MfaPolicy } from '@logto/schemas';

export const isNoSkipMfaPolicy = (policy: MfaPolicy): boolean =>
  [
    MfaPolicy.Mandatory,
    MfaPolicy.PromptAtSignInAndSignUpMandatory,
    MfaPolicy.PromptOnlyAtSignInMandatory,
  ].includes(policy);

export const isPromptOnlyAtSignInPolicy = (policy: MfaPolicy): boolean =>
  [MfaPolicy.PromptOnlyAtSignIn, MfaPolicy.PromptOnlyAtSignInMandatory].includes(policy);
