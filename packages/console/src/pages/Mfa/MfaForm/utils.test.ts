import { MfaFactor, MfaPolicy } from '@logto/schemas';

import { type MfaConfigForm } from '../types';

import {
  MfaRequirementMode,
  buildMfaPatchPayload,
  convertMfaConfigToForm,
  getMfaRequirementMode,
  getMfaRequirementState,
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
    { policy: MfaPolicy.NoPrompt, factors: [MfaFactor.TOTP] },
    { enabled: true }
  );

  expect(formState.adaptiveMfaEnabled).toBe(true);
});

test('defaults adaptive MFA to false when missing', () => {
  const formState = convertMfaConfigToForm({
    policy: MfaPolicy.NoPrompt,
    factors: [MfaFactor.TOTP],
  });

  expect(formState.adaptiveMfaEnabled).toBe(false);
});

test('builds payload with adaptive MFA only when dev features enabled', () => {
  const payload = buildMfaPatchPayload({ ...baseForm, adaptiveMfaEnabled: true }, true);

  expect(payload).toEqual({
    mfa: {
      policy: MfaPolicy.NoPrompt,
      factors: [MfaFactor.TOTP],
    },
    adaptiveMfa: { enabled: true },
  });

  const payloadWithoutAdaptiveMfa = buildMfaPatchPayload(
    { ...baseForm, adaptiveMfaEnabled: true },
    false
  );

  expect(payloadWithoutAdaptiveMfa).toEqual({
    mfa: {
      policy: MfaPolicy.NoPrompt,
      factors: [MfaFactor.TOTP],
    },
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
  expect(getMfaRequirementState(MfaRequirementMode.Mandatory)).toEqual({
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
    expected: MfaRequirementMode.Mandatory,
  },
  {
    title: 'maps legacy mandatory+adaptive state to mandatory dropdown item',
    isMandatory: true,
    adaptiveMfaEnabled: true,
    expected: MfaRequirementMode.Mandatory,
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
    expectedPolicy: MfaPolicy.NoPrompt,
    expectedAdaptiveMfaEnabled: true,
  },
  {
    title: 'writes mandatory selection to mandatory policy and adaptive disabled payload',
    selectedMode: MfaRequirementMode.Mandatory,
    expectedPolicy: MfaPolicy.Mandatory,
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
