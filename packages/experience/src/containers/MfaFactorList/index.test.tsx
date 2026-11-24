import { MfaFactor } from '@logto/schemas';
import { fireEvent, screen } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { UserMfaFlow } from '@/types';
import { type MfaFlowState } from '@/types/guard';

import MfaFactorList from '.';

const mockedStartTotpBinding = jest.fn();
const mockedStartWebAuthnProcessing = jest.fn();
const mockedStartIdentifierMfaBinding = jest.fn();
const mockedSendMfaVerificationCode = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options && Object.keys(options).length > 0 ? `${key}:${JSON.stringify(options)}` : key,
    i18n: { dir: () => 'ltr' },
  }),
}));

jest.mock('@/hooks/use-mfa-submit-error-handler', () => ({
  __esModule: true,
  default: () => ({}),
}));

jest.mock('@/hooks/use-start-totp-binding', () => ({
  __esModule: true,
  default: () => mockedStartTotpBinding,
}));

jest.mock('@/hooks/use-start-webauthn-processing', () => ({
  __esModule: true,
  default: () => mockedStartWebAuthnProcessing,
}));

jest.mock('@/hooks/use-start-identifier-mfa-binding', () => ({
  __esModule: true,
  default: () => mockedStartIdentifierMfaBinding,
}));

jest.mock('@/hooks/use-send-mfa-verification-code', () => ({
  __esModule: true,
  default: () => ({ onSubmit: mockedSendMfaVerificationCode }),
}));

describe('<MfaFactorList />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('keeps unenrolled primary phone enabled with its masked identifier on suggest_additional_mfa when boundFactors is present', () => {
    const flowState: MfaFlowState = {
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
      skippable: true,
      suggestion: true,
    };

    const { container } = renderWithPageContext(
      <MfaFactorList flow={UserMfaFlow.MfaBinding} flowState={flowState} />
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(3);
    const [totpButton, phoneButton, emailButton] = buttons;

    expect(totpButton?.disabled).toBe(false);
    expect(phoneButton?.disabled).toBe(false);
    expect(emailButton?.disabled).toBe(true);
    expect(screen.queryByText('mfa.send_to_phone:{"identifier":"****0000"}')).not.toBeNull();

    if (phoneButton) {
      fireEvent.click(phoneButton);
    }

    expect(mockedStartIdentifierMfaBinding).toHaveBeenCalledWith(
      MfaFactor.PhoneVerificationCode,
      flowState
    );
  });

  it('keeps unenrolled primary email enabled when a sign-in passkey is in boundFactors', () => {
    const maskedIdentifiers: Partial<NonNullable<MfaFlowState['maskedIdentifiers']>> = {
      [MfaFactor.EmailVerificationCode]: 'alic****@logto.io',
    };
    const flowState: MfaFlowState = {
      availableFactors: [MfaFactor.WebAuthn, MfaFactor.EmailVerificationCode],
      maskedIdentifiers: maskedIdentifiers as MfaFlowState['maskedIdentifiers'],
      boundFactors: [MfaFactor.WebAuthn],
      isWebAuthnUsedAsSignInPasskey: true,
      skippable: true,
      suggestion: true,
    };

    const { container } = renderWithPageContext(
      <MfaFactorList flow={UserMfaFlow.MfaBinding} flowState={flowState} />
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(2);
    const [webAuthnButton, emailButton] = buttons;

    expect(webAuthnButton?.disabled).toBe(true);
    expect(emailButton?.disabled).toBe(false);
    expect(
      screen.queryByText('mfa.send_to_email:{"identifier":"alic****@logto.io"}')
    ).not.toBeNull();

    if (emailButton) {
      fireEvent.click(emailButton);
    }

    expect(mockedStartIdentifierMfaBinding).toHaveBeenCalledWith(
      MfaFactor.EmailVerificationCode,
      flowState
    );
  });

  it('falls back to disabling masked identifiers and sign-in passkey on suggestion when boundFactors is absent', () => {
    const maskedIdentifiers: Partial<NonNullable<MfaFlowState['maskedIdentifiers']>> = {
      [MfaFactor.EmailVerificationCode]: 'alic****@logto.io',
    };
    const flowState: MfaFlowState = {
      availableFactors: [MfaFactor.TOTP, MfaFactor.WebAuthn, MfaFactor.EmailVerificationCode],
      maskedIdentifiers: maskedIdentifiers as MfaFlowState['maskedIdentifiers'],
      isWebAuthnUsedAsSignInPasskey: true,
      skippable: true,
      suggestion: true,
    };

    const { container } = renderWithPageContext(
      <MfaFactorList flow={UserMfaFlow.MfaBinding} flowState={flowState} />
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(3);
    const [totpButton, webAuthnButton, emailButton] = buttons;

    expect(totpButton?.disabled).toBe(false);
    expect(webAuthnButton?.disabled).toBe(true);
    expect(emailButton?.disabled).toBe(true);
  });
});
