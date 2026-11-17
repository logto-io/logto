import { MfaFactor, type RequestErrorBody } from '@logto/schemas';
import { act, renderHook } from '@testing-library/react';

import useMfaErrorHandler from './use-mfa-error-handler';

const mockedNavigate = jest.fn();
const mockedStartIdentifierMfaBinding = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('./use-navigate-with-preserved-search-params', () => ({
  __esModule: true,
  default: () => mockedNavigate,
}));

jest.mock('./use-send-mfa-verification-code', () => ({
  __esModule: true,
  default: () => ({ onSubmit: jest.fn() }),
}));

jest.mock('./use-start-backup-code-binding', () => ({
  __esModule: true,
  default: () => jest.fn(),
}));

jest.mock('./use-start-identifier-mfa-binding', () => ({
  __esModule: true,
  default: () => mockedStartIdentifierMfaBinding,
}));

jest.mock('./use-start-totp-binding', () => ({
  __esModule: true,
  default: () => jest.fn(),
}));

jest.mock('./use-start-webauthn-processing', () => ({
  __esModule: true,
  default: () => jest.fn(),
}));

jest.mock('./use-toast', () => ({
  __esModule: true,
  default: () => ({ setToast: jest.fn() }),
}));

describe('useMfaErrorHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not carry unused error data through the suggest-MFA onboarding redirect', async () => {
    const { result } = renderHook(() => useMfaErrorHandler());
    const error: RequestErrorBody = {
      code: 'user.suggest_mfa',
      message: 'MFA suggested',
      data: { futureField: 'ignored' },
    };

    await act(async () => {
      await result.current['user.suggest_mfa']?.(error);
    });

    expect(mockedNavigate).toHaveBeenCalledWith(
      { pathname: '/mfa-onboarding' },
      { replace: undefined }
    );
  });

  it('masks unknown error data before forwarding MFA flow state', async () => {
    const { result } = renderHook(() => useMfaErrorHandler());
    const error: RequestErrorBody = {
      code: 'user.missing_mfa',
      message: 'MFA is missing',
      data: {
        availableFactors: [MfaFactor.TOTP, MfaFactor.WebAuthn],
        futureField: 'ignored',
      },
    };

    await act(async () => {
      await result.current['user.missing_mfa']?.(error);
    });

    expect(mockedNavigate).toHaveBeenCalledWith(
      { pathname: '/mfa-binding' },
      {
        replace: undefined,
        state: {
          availableFactors: [MfaFactor.TOTP, MfaFactor.WebAuthn],
        },
      }
    );
  });

  it.each([
    { factor: MfaFactor.EmailVerificationCode, masked: 'f***@logto.io' },
    { factor: MfaFactor.PhoneVerificationCode, masked: '****1234' },
  ])('delegates single $factor binding with maskedIdentifiers', async ({ factor, masked }) => {
    const { result } = renderHook(() => useMfaErrorHandler({ replace: true }));
    const error: RequestErrorBody = {
      code: 'user.missing_mfa',
      message: 'MFA is missing',
      data: {
        availableFactors: [factor],
        maskedIdentifiers: { [factor]: masked },
        skippable: true,
      },
    };

    await act(async () => {
      await result.current['user.missing_mfa']?.(error);
    });

    expect(mockedStartIdentifierMfaBinding).toHaveBeenCalledWith(factor, {
      availableFactors: [factor],
      maskedIdentifiers: { [factor]: masked },
      skippable: true,
    });
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it('forwards boundFactors and maskedIdentifiers on suggest_additional_mfa', async () => {
    const { result } = renderHook(() => useMfaErrorHandler({ replace: true }));
    const error: RequestErrorBody = {
      code: 'session.mfa.suggest_additional_mfa',
      message: 'Suggest additional MFA',
      data: {
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
      },
    };

    await act(async () => {
      await result.current['session.mfa.suggest_additional_mfa']?.(error);
    });

    expect(mockedNavigate).toHaveBeenCalledWith(
      { pathname: '/mfa-binding' },
      {
        replace: true,
        state: {
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
        },
      }
    );
  });
});
