import { MfaFactor, MfaPolicy } from '@logto/schemas';

import { type MfaConfigForm } from '../types';

import { buildMfaPatchPayload, convertMfaConfigToForm } from './utils';

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
