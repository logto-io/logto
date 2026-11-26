import {
  AlternativeSignUpIdentifier,
  InteractionEvent,
  MfaFactor,
  MfaPolicy,
  MfaVerificationCodeEnrollment,
  OrganizationRequiredMfaPolicy,
  SignInIdentifier,
  type Mfa as MfaSettings,
} from '@logto/schemas';

import {
  MfaEnrollmentKind,
  type MfaEnrollmentDecision,
  type MfaEnrollmentSnapshot,
  resolveMfaEnrollmentRequirement,
  resolvePreBindMfaEnrollment,
} from './mfa-enrollment-decision.js';

type ExpectedDecision = Partial<MfaEnrollmentDecision> & Pick<MfaEnrollmentDecision, 'kind'>;

type MatrixCase = {
  name: string;
  isDevFeaturesEnabled?: boolean;
  mfaSettings?: Partial<MfaSettings>;
  interactionEvent?: InteractionEvent;
  userMfaConfig?: MfaEnrollmentSnapshot['userMfaConfig'];
  isMfaRequiredByUser?: boolean;
  asNoSkipMandatoryPolicy?: boolean;
  enrollmentFactors?: readonly MfaFactor[];
  userFactors?: readonly MfaFactor[];
  boundMfaFactors?: readonly MfaFactor[];
  canBindMfa?: boolean;
  additionalBindingSuggestionSkippedInSession?: boolean;
  primaryEmail?: string | undefined;
  primaryPhone?: string | undefined;
  additionalSuggestionContext?: MfaEnrollmentSnapshot['additionalSuggestionContext'];
  expectedExempted?: boolean;
  expected: ExpectedDecision;
};

const { None, SuggestEnable, Missing, SuggestAdditional, BackupCode } = MfaEnrollmentKind;

const mfa = (
  policy: MfaPolicy,
  factors: MfaFactor[] = [MfaFactor.TOTP],
  extra: Partial<MfaSettings> = {}
): Partial<MfaSettings> => ({ policy, factors, ...extra });

const buildSnapshot = ({
  isDevFeaturesEnabled = false,
  mfaSettings,
  interactionEvent = InteractionEvent.SignIn,
  userMfaConfig = {},
  isMfaRequiredByUser = false,
  asNoSkipMandatoryPolicy = false,
  enrollmentFactors,
  userFactors = [],
  boundMfaFactors = [],
  canBindMfa = true,
  additionalBindingSuggestionSkippedInSession = false,
  primaryEmail,
  primaryPhone,
  additionalSuggestionContext,
}: Omit<MatrixCase, 'name' | 'expected' | 'expectedExempted'>): MfaEnrollmentSnapshot => {
  const resolvedSettings: MfaSettings = {
    policy: MfaPolicy.PromptAtSignInAndSignUp,
    factors: [MfaFactor.TOTP],
    organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
    ...mfaSettings,
  };

  return {
    isDevFeaturesEnabled,
    mfaSettings: resolvedSettings,
    interactionEvent,
    userMfaConfig,
    isMfaRequiredByUser,
    asNoSkipMandatoryPolicy,
    enrollmentFactors,
    configuredFactors: resolvedSettings.factors.filter((factor) => factor !== MfaFactor.BackupCode),
    userFactors,
    boundMfaFactors,
    canBindMfa,
    additionalBindingSuggestionSkippedInSession,
    primaryEmail,
    primaryPhone,
    additionalSuggestionContext,
  };
};

const toExpectedDecision = ({
  skippable = false,
  availableFactors = [],
  shouldBackfillMfaEnabled = false,
  ...rest
}: ExpectedDecision): MfaEnrollmentDecision => ({
  skippable,
  availableFactors,
  shouldBackfillMfaEnabled,
  ...rest,
});

const matrix: MatrixCase[] = [
  {
    name: 'exempts when no MFA factors are enabled even if user/org requires MFA',
    mfaSettings: mfa(MfaPolicy.Mandatory, []),
    isMfaRequiredByUser: true,
    expectedExempted: true,
    expected: { kind: None },
  },
  {
    name: 'exempts Register under PromptOnlyAtSignIn without optional backfill',
    mfaSettings: mfa(MfaPolicy.PromptOnlyAtSignIn),
    interactionEvent: InteractionEvent.Register,
    isMfaRequiredByUser: true,
    expectedExempted: true,
    expected: { kind: None },
  },
  {
    name: 'exempts Register under PromptOnlyAtSignInMandatory',
    mfaSettings: mfa(MfaPolicy.PromptOnlyAtSignInMandatory),
    interactionEvent: InteractionEvent.Register,
    expectedExempted: true,
    expected: { kind: None },
  },
  {
    name: 'exempts NoPrompt when MFA is not required for the user',
    mfaSettings: mfa(MfaPolicy.NoPrompt),
    userMfaConfig: { enabled: false },
    expectedExempted: true,
    expected: { kind: None },
  },
  {
    name: 'exempts PromptAtSignInAndSignUp when user skipped and MFA is not required',
    mfaSettings: mfa(MfaPolicy.PromptAtSignInAndSignUp),
    userMfaConfig: { enabled: false, skipped: true },
    expectedExempted: true,
    expected: { kind: None },
  },
  {
    name: 'exempts skipped user with existing factors without backfilling legacy enabled',
    mfaSettings: mfa(MfaPolicy.PromptOnlyAtSignIn),
    userMfaConfig: { skipped: true },
    userFactors: [MfaFactor.TOTP],
    expectedExempted: true,
    expected: { kind: None },
  },
  {
    name: 'suggests enabling optional MFA when enabled=undefined and user has no factors',
    mfaSettings: mfa(MfaPolicy.PromptAtSignInAndSignUp),
    interactionEvent: InteractionEvent.Register,
    expected: { kind: SuggestEnable, skippable: true },
  },
  {
    name: 'suggests enabling optional MFA on SignIn under PromptOnlyAtSignIn when enabled=false',
    mfaSettings: mfa(MfaPolicy.PromptOnlyAtSignIn),
    userMfaConfig: { enabled: false },
    expected: { kind: SuggestEnable, skippable: true },
  },
  {
    name: 'backfills legacy enabled=true and fulfills when user already has a factor',
    mfaSettings: mfa(MfaPolicy.PromptAtSignInAndSignUp),
    userFactors: [MfaFactor.TOTP],
    expected: { kind: None, shouldBackfillMfaEnabled: true },
  },
  {
    name: 'prompts skippable missing_mfa when optional MFA is enabled with no bound factors',
    mfaSettings: mfa(MfaPolicy.PromptAtSignInAndSignUp),
    userMfaConfig: { enabled: true },
    canBindMfa: false,
    expected: {
      kind: Missing,
      skippable: true,
      availableFactors: [MfaFactor.TOTP],
    },
  },
  {
    name: 'enforces non-skippable missing_mfa under Mandatory even when user skipped',
    mfaSettings: mfa(MfaPolicy.Mandatory),
    userMfaConfig: { enabled: false, skipped: true },
    expected: { kind: Missing, availableFactors: [MfaFactor.TOTP] },
  },
  {
    name: 'enforces non-skippable missing_mfa under PromptAtSignInAndSignUpMandatory on Register',
    mfaSettings: mfa(MfaPolicy.PromptAtSignInAndSignUpMandatory),
    interactionEvent: InteractionEvent.Register,
    expected: { kind: Missing, availableFactors: [MfaFactor.TOTP] },
  },
  {
    name: 'enforces non-skippable missing_mfa under PromptOnlyAtSignInMandatory on SignIn',
    mfaSettings: mfa(MfaPolicy.PromptOnlyAtSignInMandatory),
    expected: { kind: Missing, availableFactors: [MfaFactor.TOTP] },
  },
  {
    name: 'enforces non-skippable missing_mfa when user/org requires MFA under NoPrompt + skip',
    mfaSettings: mfa(MfaPolicy.NoPrompt, [MfaFactor.TOTP], {
      organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.Mandatory,
    }),
    userMfaConfig: { enabled: false, skipped: true },
    isMfaRequiredByUser: true,
    expected: { kind: Missing, availableFactors: [MfaFactor.TOTP] },
  },
  {
    name: 'enforces pairable factors under asNoSkipMandatoryPolicy on PromptOnlyAtSignIn Register',
    mfaSettings: mfa(MfaPolicy.PromptOnlyAtSignIn, [
      MfaFactor.EmailVerificationCode,
      MfaFactor.TOTP,
    ]),
    interactionEvent: InteractionEvent.Register,
    userMfaConfig: { enabled: false, skipped: true },
    asNoSkipMandatoryPolicy: true,
    enrollmentFactors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP],
    userFactors: [MfaFactor.EmailVerificationCode],
    expected: { kind: Missing, availableFactors: [MfaFactor.TOTP] },
  },
  {
    name: 'omits maskedIdentifiers on missing_mfa when isDevFeaturesEnabled=false',
    isDevFeaturesEnabled: false,
    mfaSettings: mfa(MfaPolicy.Mandatory, [
      MfaFactor.TOTP,
      MfaFactor.EmailVerificationCode,
      MfaFactor.PhoneVerificationCode,
    ]),
    primaryEmail: 'alice@logto.io',
    primaryPhone: '16502530000',
    expected: {
      kind: Missing,
      availableFactors: [
        MfaFactor.TOTP,
        MfaFactor.EmailVerificationCode,
        MfaFactor.PhoneVerificationCode,
      ],
    },
  },
  {
    name: 'exposes maskedIdentifiers on missing_mfa when isDevFeaturesEnabled=true',
    isDevFeaturesEnabled: true,
    mfaSettings: mfa(MfaPolicy.Mandatory, [
      MfaFactor.TOTP,
      MfaFactor.EmailVerificationCode,
      MfaFactor.PhoneVerificationCode,
    ]),
    primaryEmail: 'alice@logto.io',
    primaryPhone: '16502530000',
    expected: {
      kind: Missing,
      availableFactors: [
        MfaFactor.TOTP,
        MfaFactor.EmailVerificationCode,
        MfaFactor.PhoneVerificationCode,
      ],
      maskedIdentifiers: {
        [MfaFactor.EmailVerificationCode]: 'alic****@logto.io',
        [MfaFactor.PhoneVerificationCode]: '****0000',
      },
    },
  },
  {
    name: 'does not suggest additional MFA or backup codes when canBindMfa=false',
    isDevFeaturesEnabled: true,
    mfaSettings: mfa(MfaPolicy.Mandatory, [
      MfaFactor.EmailVerificationCode,
      MfaFactor.TOTP,
      MfaFactor.BackupCode,
    ]),
    userFactors: [MfaFactor.EmailVerificationCode],
    canBindMfa: false,
    additionalSuggestionContext: {
      signUp: { identifiers: [SignInIdentifier.Email] },
      passkeySignInEnabled: false,
    },
    expected: { kind: None },
  },
  {
    name: 'suggests additional MFA in implicit mode (isDevFeaturesEnabled=false) for signup Email',
    isDevFeaturesEnabled: false,
    mfaSettings: mfa(MfaPolicy.Mandatory, [MfaFactor.EmailVerificationCode, MfaFactor.TOTP], {
      verificationCodeEnrollment: MfaVerificationCodeEnrollment.Explicit,
    }),
    userFactors: [MfaFactor.EmailVerificationCode],
    primaryEmail: 'alice@logto.io',
    additionalSuggestionContext: {
      signUp: {
        identifiers: [SignInIdentifier.Username],
        secondaryIdentifiers: [{ identifier: AlternativeSignUpIdentifier.EmailOrPhone }],
      },
      passkeySignInEnabled: false,
      effectiveEmail: 'alice@logto.io',
    },
    expected: {
      kind: SuggestAdditional,
      skippable: true,
      availableFactors: [MfaFactor.TOTP, MfaFactor.EmailVerificationCode],
      maskedIdentifiers: { [MfaFactor.EmailVerificationCode]: 'alic****@logto.io' },
      isWebAuthnUsedAsSignInPasskey: false,
    },
  },
  {
    name: 'suggests additional MFA in explicit mode with boundFactors and unenrolled identifier',
    isDevFeaturesEnabled: true,
    mfaSettings: mfa(
      MfaPolicy.Mandatory,
      [MfaFactor.EmailVerificationCode, MfaFactor.PhoneVerificationCode, MfaFactor.TOTP],
      { verificationCodeEnrollment: MfaVerificationCodeEnrollment.Explicit }
    ),
    userFactors: [MfaFactor.EmailVerificationCode],
    primaryEmail: 'alice@logto.io',
    primaryPhone: '16502530000',
    additionalSuggestionContext: {
      signUp: { identifiers: [SignInIdentifier.Username] },
      passkeySignInEnabled: false,
      effectiveEmail: 'alice@logto.io',
      sessionBoundDualPurposeFactors: { emailVerificationCode: true },
    },
    expected: {
      kind: SuggestAdditional,
      skippable: true,
      availableFactors: [
        MfaFactor.TOTP,
        MfaFactor.PhoneVerificationCode,
        MfaFactor.EmailVerificationCode,
      ],
      maskedIdentifiers: {
        [MfaFactor.EmailVerificationCode]: 'alic****@logto.io',
        [MfaFactor.PhoneVerificationCode]: '****0000',
      },
      boundFactors: [MfaFactor.EmailVerificationCode],
      isWebAuthnUsedAsSignInPasskey: false,
    },
  },
  {
    name: 'suggests additional MFA in explicit mode when WebAuthn bound as sign-in passkey',
    isDevFeaturesEnabled: true,
    mfaSettings: mfa(MfaPolicy.Mandatory, [MfaFactor.WebAuthn, MfaFactor.TOTP], {
      verificationCodeEnrollment: MfaVerificationCodeEnrollment.Explicit,
    }),
    userFactors: [MfaFactor.WebAuthn],
    additionalSuggestionContext: {
      signUp: { identifiers: [SignInIdentifier.Username] },
      passkeySignInEnabled: true,
      sessionBoundDualPurposeFactors: { webAuthn: true },
    },
    expected: {
      kind: SuggestAdditional,
      skippable: true,
      availableFactors: [MfaFactor.WebAuthn, MfaFactor.TOTP],
      maskedIdentifiers: {},
      boundFactors: [MfaFactor.WebAuthn],
      isWebAuthnUsedAsSignInPasskey: true,
    },
  },
  {
    name: 'skips additional MFA in explicit mode when factor is stored-only or multiple bound',
    isDevFeaturesEnabled: true,
    mfaSettings: mfa(MfaPolicy.Mandatory, [MfaFactor.EmailVerificationCode, MfaFactor.TOTP], {
      verificationCodeEnrollment: MfaVerificationCodeEnrollment.Explicit,
    }),
    userFactors: [MfaFactor.EmailVerificationCode],
    additionalSuggestionContext: {
      signUp: { identifiers: [SignInIdentifier.Email] },
      passkeySignInEnabled: false,
      sessionBoundDualPurposeFactors: {},
    },
    expected: { kind: None },
  },
  {
    name: 'requires backup codes when enabled, missing, canBindMfa=true, and suggestion skipped',
    mfaSettings: mfa(MfaPolicy.PromptAtSignInAndSignUp, [MfaFactor.TOTP, MfaFactor.BackupCode], {
      skipAdditionalBindingSuggestion: true,
    }),
    userMfaConfig: { additionalBindingSuggestionSkipped: true },
    userFactors: [MfaFactor.TOTP],
    expected: {
      kind: BackupCode,
      availableFactors: [MfaFactor.BackupCode],
      shouldBackfillMfaEnabled: true,
    },
  },
  {
    name: 'fulfills backup codes when backup code was bound in the current session',
    mfaSettings: mfa(MfaPolicy.Mandatory, [MfaFactor.TOTP, MfaFactor.BackupCode]),
    userFactors: [MfaFactor.TOTP],
    boundMfaFactors: [MfaFactor.BackupCode],
    expected: { kind: None },
  },
];

describe('resolveMfaEnrollmentRequirement', () => {
  it.each(matrix)('$name', ({ expected, expectedExempted = false, ...input }) => {
    const snapshot = buildSnapshot(input);
    expect(resolveMfaEnrollmentRequirement(snapshot)).toEqual(toExpectedDecision(expected));
    expect(resolvePreBindMfaEnrollment(snapshot).exempted).toBe(expectedExempted);
  });

  it('covers every MfaEnrollmentKind in the matrix', () => {
    expect(new Set(matrix.map(({ expected }) => expected.kind))).toEqual(
      new Set(Object.values(MfaEnrollmentKind))
    );
  });
});
