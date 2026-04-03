import { MfaFactor, MfaPolicy, OrganizationRequiredMfaPolicy } from '@logto/schemas';

import { type MfaConfigForm } from '../types';

import {
  MfaRequirementMode,
  buildMfaPatchPayload,
  convertMfaConfigToForm,
  getMfaRequirementMode,
  getMfaRequirementState,
  normalizeSetUpPromptByRequirementMode,
} from './utils';

const baseForm: MfaConfigForm = {
  isMandatory: false,
  setUpPrompt: MfaPolicy.NoPrompt,
  totpEnabled: true,
  webAuthnEnabled: false,
  backupCodeEnabled: false,
  emailVerificationCodeEnabled: false,
  phoneVerificationCodeEnabled: false,
  organizationRequiredMfaPolicy: undefined,
  adaptiveMfaEnabled: false,
};

test('maps adaptive MFA enablement into form state', () => {
  const formState = convertMfaConfigToForm(
    { policy: MfaPolicy.PromptAtSignInAndSignUpMandatory, factors: [MfaFactor.TOTP] },
    { enabled: true }
  );

  expect(formState.adaptiveMfaEnabled).toBe(true);
  expect(formState.setUpPrompt).toBe(MfaPolicy.PromptAtSignInAndSignUpMandatory);
});

test('defaults adaptive MFA to false when missing', () => {
  const formState = convertMfaConfigToForm({
    policy: MfaPolicy.NoPrompt,
    factors: [MfaFactor.TOTP],
  });

  expect(formState.adaptiveMfaEnabled).toBe(false);
});

test('maps non-skippable policy to mandatory mode when adaptive MFA is disabled', () => {
  const formState = convertMfaConfigToForm({
    policy: MfaPolicy.PromptOnlyAtSignInMandatory,
    factors: [MfaFactor.TOTP],
  });

  expect(formState.isMandatory).toBe(true);
  expect(formState.adaptiveMfaEnabled).toBe(false);
  expect(formState.setUpPrompt).toBe(MfaPolicy.PromptOnlyAtSignInMandatory);
});

test('maps non-skippable policy to adaptive mode when adaptive MFA is enabled', () => {
  const formState = convertMfaConfigToForm(
    {
      policy: MfaPolicy.PromptOnlyAtSignInMandatory,
      factors: [MfaFactor.TOTP],
    },
    { enabled: true }
  );

  expect(formState.isMandatory).toBe(false);
  expect(formState.adaptiveMfaEnabled).toBe(true);
  expect(formState.setUpPrompt).toBe(MfaPolicy.PromptOnlyAtSignInMandatory);
});

test('maps legacy mandatory policy to default non-skippable prompt', () => {
  const formState = convertMfaConfigToForm({
    policy: MfaPolicy.Mandatory,
    factors: [MfaFactor.TOTP],
  });

  expect(formState.isMandatory).toBe(true);
  expect(formState.adaptiveMfaEnabled).toBe(false);
  expect(formState.setUpPrompt).toBe(MfaPolicy.PromptAtSignInAndSignUpMandatory);
});

test('normalizes organization policy to no prompt in mandatory mode', () => {
  const formState = convertMfaConfigToForm({
    policy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
    factors: [MfaFactor.TOTP],
    organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.Mandatory,
  });

  expect(formState.organizationRequiredMfaPolicy).toBe(OrganizationRequiredMfaPolicy.NoPrompt);
});

test('normalizes setup prompt to adaptive policy when adaptive MFA is enabled', () => {
  const formState = convertMfaConfigToForm(
    { policy: MfaPolicy.NoPrompt, factors: [MfaFactor.TOTP] },
    { enabled: true }
  );

  expect(formState.setUpPrompt).toBe(MfaPolicy.PromptAtSignInAndSignUpMandatory);
});

test('builds payload with adaptive MFA when dev features are enabled', () => {
  const payload = buildMfaPatchPayload({ ...baseForm, adaptiveMfaEnabled: true }, true);

  expect(payload).toEqual({
    mfa: {
      policy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
      factors: [MfaFactor.TOTP],
    },
    adaptiveMfa: { enabled: true },
  });
});

test('filters organization-required MFA policy when adaptive MFA is enabled', () => {
  const payload = buildMfaPatchPayload(
    {
      ...baseForm,
      adaptiveMfaEnabled: true,
      organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.Mandatory,
    },
    true
  );

  expect(payload).toEqual({
    mfa: {
      policy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
      factors: [MfaFactor.TOTP],
    },
    adaptiveMfa: { enabled: true },
  });
});

test('filters hidden prompt policies when mandatory MFA is selected', () => {
  const payload = buildMfaPatchPayload(
    {
      ...baseForm,
      isMandatory: true,
      setUpPrompt: MfaPolicy.PromptOnlyAtSignIn,
      organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.Mandatory,
    },
    true
  );

  expect(payload).toEqual({
    mfa: {
      policy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
      factors: [MfaFactor.TOTP],
    },
    adaptiveMfa: { enabled: false },
  });
});

test('maps requirement mode back to form state', () => {
  expect(getMfaRequirementState(MfaRequirementMode.Optional)).toEqual({
    isMandatory: false,
    adaptiveMfaEnabled: false,
  });
  expect(getMfaRequirementState(MfaRequirementMode.Adaptive)).toEqual({
    isMandatory: false,
    adaptiveMfaEnabled: true,
  });
  expect(getMfaRequirementState(MfaRequirementMode.Required)).toEqual({
    isMandatory: true,
    adaptiveMfaEnabled: false,
  });
});

test.each([
  {
    title: 'maps legacy optional state to optional dropdown item',
    isMandatory: false,
    adaptiveMfaEnabled: false,
    expected: MfaRequirementMode.Optional,
  },
  {
    title: 'maps legacy adaptive state to adaptive dropdown item',
    isMandatory: false,
    adaptiveMfaEnabled: true,
    expected: MfaRequirementMode.Adaptive,
  },
  {
    title: 'maps legacy mandatory state to mandatory dropdown item',
    isMandatory: true,
    adaptiveMfaEnabled: false,
    expected: MfaRequirementMode.Required,
  },
  {
    title: 'maps legacy mandatory+adaptive state to mandatory dropdown item',
    isMandatory: true,
    adaptiveMfaEnabled: true,
    expected: MfaRequirementMode.Required,
  },
])('$title', ({ isMandatory, adaptiveMfaEnabled, expected }) => {
  expect(getMfaRequirementMode({ isMandatory, adaptiveMfaEnabled })).toBe(expected);
});

test.each([
  {
    title: 'writes optional selection to non-mandatory and adaptive disabled payload',
    selectedMode: MfaRequirementMode.Optional,
    expectedPolicy: MfaPolicy.NoPrompt,
    expectedAdaptiveMfaEnabled: false,
  },
  {
    title: 'writes adaptive selection to non-mandatory and adaptive enabled payload',
    selectedMode: MfaRequirementMode.Adaptive,
    expectedPolicy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
    expectedAdaptiveMfaEnabled: true,
  },
  {
    title: 'writes mandatory selection to mandatory policy and adaptive disabled payload',
    selectedMode: MfaRequirementMode.Required,
    expectedPolicy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
    expectedAdaptiveMfaEnabled: false,
  },
])('$title', ({ selectedMode, expectedPolicy, expectedAdaptiveMfaEnabled }) => {
  const nextState = getMfaRequirementState(selectedMode);
  const payload = buildMfaPatchPayload({ ...baseForm, ...nextState }, true);

  expect(payload).toEqual({
    mfa: {
      policy: expectedPolicy,
      factors: [MfaFactor.TOTP],
    },
    adaptiveMfa: {
      enabled: expectedAdaptiveMfaEnabled,
    },
  });
});

test('writes mandatory prompt-only selection to non-skippable prompt policy', () => {
  const payload = buildMfaPatchPayload(
    {
      ...baseForm,
      ...getMfaRequirementState(MfaRequirementMode.Required),
      setUpPrompt: MfaPolicy.PromptOnlyAtSignInMandatory,
    },
    true
  );

  expect(payload).toEqual({
    mfa: {
      policy: MfaPolicy.PromptOnlyAtSignInMandatory,
      factors: [MfaFactor.TOTP],
    },
    adaptiveMfa: {
      enabled: false,
    },
  });
});

test('does not persist organization-required mfa policy in mandatory mode', () => {
  const payload = buildMfaPatchPayload(
    {
      ...baseForm,
      ...getMfaRequirementState(MfaRequirementMode.Required),
      organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.Mandatory,
    },
    true
  );

  expect(payload.mfa).toEqual({
    policy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
    factors: [MfaFactor.TOTP],
  });
});

test('switches prompt to no prompt when changing from required mfa to optional mfa', () => {
  expect(
    normalizeSetUpPromptByRequirementMode(
      MfaPolicy.PromptOnlyAtSignInMandatory,
      MfaRequirementMode.Optional
    )
  ).toBe(MfaPolicy.NoPrompt);
});

test('keeps current optional prompt when switching within optional mode', () => {
  expect(
    normalizeSetUpPromptByRequirementMode(MfaPolicy.PromptOnlyAtSignIn, MfaRequirementMode.Optional)
  ).toBe(MfaPolicy.PromptOnlyAtSignIn);
});

test('builds legacy mandatory payload when dev features are disabled', () => {
  const payload = buildMfaPatchPayload(
    { ...baseForm, ...getMfaRequirementState(MfaRequirementMode.Required) },
    false
  );

  expect(payload).toEqual({
    mfa: {
      policy: MfaPolicy.Mandatory,
      factors: [MfaFactor.TOTP],
    },
    adaptiveMfa: {
      enabled: false,
    },
  });
});
