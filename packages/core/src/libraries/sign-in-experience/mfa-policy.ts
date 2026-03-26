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

export const transformRequiredMfaPolicy = ({
  policy,
  isDevFeaturesEnabled,
  adaptiveMfaEnabled,
}: {
  policy: MfaPolicy;
  isDevFeaturesEnabled: boolean;
  adaptiveMfaEnabled?: boolean;
}): MfaPolicy =>
  isDevFeaturesEnabled
    ? normalizeRequiredMfaPolicy(policy)
    : legacyizeRequiredMfaPolicy(policy, adaptiveMfaEnabled);

export const legacyizeRequiredMfaPolicy = (
  policy: MfaPolicy,
  adaptiveMfaEnabled?: boolean
): MfaPolicy =>
  adaptiveMfaEnabled !== true && isNonSkippableMfaPromptPolicy(policy)
    ? MfaPolicy.Mandatory
    : policy;
