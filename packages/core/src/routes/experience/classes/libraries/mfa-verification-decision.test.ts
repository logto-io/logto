import { AuthenticationFactor, MfaFactor, MfaPolicy, VerificationType } from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';

import { AdaptiveMfaRule, type AdaptiveMfaResult } from './adaptive-mfa-validator/types.js';
import {
  MfaVerificationReason,
  type MfaVerificationSnapshot,
  resolveMfaVerificationRequirement,
} from './mfa-verification-decision.js';

const adaptiveTriggered: AdaptiveMfaResult = {
  requiresMfa: true,
  triggeredRules: [
    {
      rule: AdaptiveMfaRule.UntrustedIp,
      details: { signals: { botScore: 10 }, matchedSignals: ['botScore'] },
    },
  ],
};
const adaptiveNotTriggered: AdaptiveMfaResult = {
  requiresMfa: false,
  triggeredRules: [],
};

type MatrixCase = {
  name: string;
  mfaPolicy?: MfaPolicy;
  adaptiveMfaResult?: Optional<AdaptiveMfaResult>;
  userFactors?: readonly MfaFactor[];
  userMfaConfig?: MfaVerificationSnapshot['userMfaConfig'];
  isMfaRequiredByUser?: boolean;
  hasVerifiedSsoIdentity?: boolean;
  hasVerifiedSignInPasskey?: boolean;
  hasVerifiedMfaRecord?: boolean;
  isTrustedDeviceVerified?: boolean;
  requestedAcr?: MfaVerificationSnapshot['requestedAcr'];
  allowSoftExemptions?: boolean;
  expectedRequired: boolean;
  expectedReason: MfaVerificationReason;
  expectedFactors: MfaFactor[];
};

const toSnapshot = ({
  mfaPolicy = MfaPolicy.PromptAtSignInAndSignUp,
  adaptiveMfaResult,
  userFactors = [MfaFactor.TOTP],
  userMfaConfig = {},
  isMfaRequiredByUser = false,
  hasVerifiedSsoIdentity = false,
  hasVerifiedSignInPasskey = false,
  hasVerifiedMfaRecord = false,
  isTrustedDeviceVerified = false,
  requestedAcr,
  allowSoftExemptions,
}: MatrixCase): MfaVerificationSnapshot => ({
  mfaSettings: { policy: mfaPolicy },
  adaptiveMfaResult,
  userFactors,
  userMfaConfig,
  isMfaRequiredByUser,
  hasVerifiedSsoIdentity,
  hasVerifiedSignInPasskey,
  hasVerifiedMfaRecord,
  isTrustedDeviceVerified,
  requestedAcr,
  allowSoftExemptions,
});

// Specification matrix: tenant mode (optional, adaptive, mandatory) x user state x sign-in proof /
// trusted device / requested ACR -> required, reason, and availableFactors.
const verificationMatrix: MatrixCase[] = [
  // Optional policy (non-mandatory, adaptive off)
  {
    name: 'optional: no factors -> noFactors',
    mfaPolicy: MfaPolicy.PromptAtSignInAndSignUp,
    userFactors: [],
    expectedRequired: false,
    expectedReason: MfaVerificationReason.NoFactors,
    expectedFactors: [],
  },
  {
    name: 'optional: has factor, default flags -> required',
    mfaPolicy: MfaPolicy.PromptAtSignInAndSignUp,
    expectedRequired: true,
    expectedReason: MfaVerificationReason.Required,
    expectedFactors: [MfaFactor.TOTP],
  },
  {
    name: 'optional: NoPrompt still requires verification for unskipped user with factors',
    mfaPolicy: MfaPolicy.NoPrompt,
    expectedRequired: true,
    expectedReason: MfaVerificationReason.Required,
    expectedFactors: [MfaFactor.TOTP],
  },
  {
    name: 'optional: PromptOnlyAtSignIn requires verification when enabled',
    mfaPolicy: MfaPolicy.PromptOnlyAtSignIn,
    userMfaConfig: { enabled: true },
    expectedRequired: true,
    expectedReason: MfaVerificationReason.Required,
    expectedFactors: [MfaFactor.TOTP],
  },
  {
    name: 'optional: enabled=false opts out -> userOptedOut',
    mfaPolicy: MfaPolicy.PromptAtSignInAndSignUp,
    userMfaConfig: { enabled: false },
    expectedRequired: false,
    expectedReason: MfaVerificationReason.UserOptedOut,
    expectedFactors: [],
  },
  {
    name: 'optional: skipMfaOnSignIn=true opts out -> userOptedOut',
    mfaPolicy: MfaPolicy.NoPrompt,
    userMfaConfig: { skipMfaOnSignIn: true },
    expectedRequired: false,
    expectedReason: MfaVerificationReason.UserOptedOut,
    expectedFactors: [],
  },
  {
    name: 'optional: per-user/org requirement overrides user opt-out -> required',
    mfaPolicy: MfaPolicy.NoPrompt,
    userMfaConfig: { enabled: false, skipMfaOnSignIn: true },
    isMfaRequiredByUser: true,
    expectedRequired: true,
    expectedReason: MfaVerificationReason.Required,
    expectedFactors: [MfaFactor.TOTP],
  },
  // Mandatory policies (adaptive off)
  {
    name: 'mandatory: ignores user opt-out -> required',
    mfaPolicy: MfaPolicy.Mandatory,
    userMfaConfig: { enabled: false, skipMfaOnSignIn: true },
    expectedRequired: true,
    expectedReason: MfaVerificationReason.Required,
    expectedFactors: [MfaFactor.TOTP],
  },
  {
    name: 'PromptAtSignInAndSignUpMandatory: ignores user opt-out -> required',
    mfaPolicy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
    userMfaConfig: { skipMfaOnSignIn: true },
    expectedRequired: true,
    expectedReason: MfaVerificationReason.Required,
    expectedFactors: [MfaFactor.TOTP],
  },
  {
    name: 'PromptOnlyAtSignInMandatory: ignores user opt-out -> required',
    mfaPolicy: MfaPolicy.PromptOnlyAtSignInMandatory,
    userMfaConfig: { enabled: false },
    expectedRequired: true,
    expectedReason: MfaVerificationReason.Required,
    expectedFactors: [MfaFactor.TOTP],
  },
  {
    name: 'mandatory: no factors -> noFactors',
    mfaPolicy: MfaPolicy.Mandatory,
    userFactors: [],
    expectedRequired: false,
    expectedReason: MfaVerificationReason.NoFactors,
    expectedFactors: [],
  },
  // Adaptive MFA (decides alone when enabled)
  {
    name: 'adaptive: not triggered even under mandatory/per-user requirement -> adaptiveNotTriggered',
    mfaPolicy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
    adaptiveMfaResult: adaptiveNotTriggered,
    isMfaRequiredByUser: true,
    expectedRequired: false,
    expectedReason: MfaVerificationReason.AdaptiveNotTriggered,
    expectedFactors: [],
  },
  {
    name: 'adaptive: not triggered with no factors -> adaptiveNotTriggered',
    mfaPolicy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
    adaptiveMfaResult: adaptiveNotTriggered,
    userFactors: [],
    expectedRequired: false,
    expectedReason: MfaVerificationReason.AdaptiveNotTriggered,
    expectedFactors: [],
  },
  {
    name: 'adaptive: triggered overrides user opt-out -> required',
    mfaPolicy: MfaPolicy.PromptAtSignInAndSignUp,
    adaptiveMfaResult: adaptiveTriggered,
    userMfaConfig: { enabled: false, skipMfaOnSignIn: true },
    expectedRequired: true,
    expectedReason: MfaVerificationReason.Required,
    expectedFactors: [MfaFactor.TOTP],
  },
  {
    name: 'adaptive: triggered with no factors -> noFactors',
    mfaPolicy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
    adaptiveMfaResult: adaptiveTriggered,
    userFactors: [],
    expectedRequired: false,
    expectedReason: MfaVerificationReason.NoFactors,
    expectedFactors: [],
  },
  // Sign-in exemptions and challenge satisfaction
  {
    name: 'SSO sign-in exempts even under mandatory/adaptive triggered -> ssoExempt',
    mfaPolicy: MfaPolicy.Mandatory,
    adaptiveMfaResult: adaptiveTriggered,
    isMfaRequiredByUser: true,
    hasVerifiedSsoIdentity: true,
    expectedRequired: false,
    expectedReason: MfaVerificationReason.SsoExempt,
    expectedFactors: [],
  },
  {
    name: 'passkey sign-in exempts even under mandatory/adaptive triggered -> passkeyExempt',
    mfaPolicy: MfaPolicy.Mandatory,
    adaptiveMfaResult: adaptiveTriggered,
    isMfaRequiredByUser: true,
    hasVerifiedSignInPasskey: true,
    expectedRequired: false,
    expectedReason: MfaVerificationReason.PasskeyExempt,
    expectedFactors: [],
  },
  {
    name: 'verified MFA challenge satisfies gate -> alreadyVerified',
    mfaPolicy: MfaPolicy.Mandatory,
    adaptiveMfaResult: adaptiveTriggered,
    hasVerifiedMfaRecord: true,
    expectedRequired: false,
    expectedReason: MfaVerificationReason.AlreadyVerified,
    expectedFactors: [],
  },
  {
    name: 'trusted device satisfies mandatory/adaptive triggered gate -> trustedDevice',
    mfaPolicy: MfaPolicy.Mandatory,
    adaptiveMfaResult: adaptiveTriggered,
    isTrustedDeviceVerified: true,
    expectedRequired: false,
    expectedReason: MfaVerificationReason.TrustedDevice,
    expectedFactors: [],
  },
  // Requested ACR (`urn:logto:acr:mfa`)
  {
    name: 'requested ACR satisfied -> requestedAcrSatisfied',
    mfaPolicy: MfaPolicy.Mandatory,
    requestedAcr: {
      isRequestedMfaUnmet: false,
      isRequestedMfaSatisfied: true,
    },
    expectedRequired: false,
    expectedReason: MfaVerificationReason.RequestedAcrSatisfied,
    expectedFactors: [],
  },
  {
    name: 'requested ACR unmet ignores SSO, adaptive non-trigger, opt-out, unpairable MFA, trusted device',
    mfaPolicy: MfaPolicy.NoPrompt,
    adaptiveMfaResult: adaptiveNotTriggered,
    userFactors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP],
    userMfaConfig: { enabled: false, skipMfaOnSignIn: true },
    hasVerifiedSsoIdentity: true,
    hasVerifiedMfaRecord: true,
    isTrustedDeviceVerified: true,
    requestedAcr: {
      isRequestedMfaUnmet: true,
      isRequestedMfaSatisfied: false,
      hasFreshFirstFactor: true,
      provenFirstFactors: [AuthenticationFactor.Email],
      eligibleMethods: [VerificationType.MfaEmailVerificationCode, VerificationType.TOTP],
    },
    expectedRequired: true,
    expectedReason: MfaVerificationReason.Required,
    expectedFactors: [MfaFactor.TOTP],
  },
  {
    name: 'requested ACR unmet with only same-family factor -> noFactors',
    mfaPolicy: MfaPolicy.Mandatory,
    userFactors: [MfaFactor.EmailVerificationCode],
    requestedAcr: {
      isRequestedMfaUnmet: true,
      isRequestedMfaSatisfied: false,
      hasFreshFirstFactor: true,
      provenFirstFactors: [AuthenticationFactor.Email],
      eligibleMethods: [VerificationType.MfaEmailVerificationCode],
    },
    expectedRequired: false,
    expectedReason: MfaVerificationReason.NoFactors,
    expectedFactors: [],
  },
  // Binding guard (`allowSoftExemptions: false`)
  {
    name: 'binding guard rejects adaptive non-trigger, opt-out, and trusted device -> required',
    mfaPolicy: MfaPolicy.NoPrompt,
    adaptiveMfaResult: adaptiveNotTriggered,
    userMfaConfig: { enabled: false, skipMfaOnSignIn: true },
    isTrustedDeviceVerified: true,
    allowSoftExemptions: false,
    expectedRequired: true,
    expectedReason: MfaVerificationReason.Required,
    expectedFactors: [MfaFactor.TOTP],
  },
  {
    name: 'binding guard with unmet requested ACR and no fresh first factor keeps user factors -> required',
    mfaPolicy: MfaPolicy.NoPrompt,
    userFactors: [MfaFactor.TOTP],
    requestedAcr: {
      isRequestedMfaUnmet: true,
      isRequestedMfaSatisfied: false,
      hasFreshFirstFactor: false,
      provenFirstFactors: [],
      eligibleMethods: [],
    },
    allowSoftExemptions: false,
    expectedRequired: true,
    expectedReason: MfaVerificationReason.Required,
    expectedFactors: [MfaFactor.TOTP],
  },
];

describe('resolveMfaVerificationRequirement decision matrix', () => {
  it.each(verificationMatrix)('$name', (testCase) => {
    const decision = resolveMfaVerificationRequirement(toSnapshot(testCase));

    expect(decision).toEqual({
      required: testCase.expectedRequired,
      reason: testCase.expectedReason,
      availableFactors: testCase.expectedFactors,
    });
  });

  it('covers every MfaVerificationReason value in the matrix', () => {
    const coveredReasons = new Set(verificationMatrix.map(({ expectedReason }) => expectedReason));
    expect(coveredReasons).toEqual(new Set(Object.values(MfaVerificationReason)));
  });
});
