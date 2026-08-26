import { type RequestErrorBody } from '@logto/schemas';
import { act, renderHook } from '@testing-library/react';

import useMfaErrorHandler from './use-mfa-error-handler';

const mockedNavigate = jest.fn();

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

  it('carries trusted-device availability through the suggest-MFA onboarding redirect', async () => {
    const { result } = renderHook(() => useMfaErrorHandler());
    const error: RequestErrorBody = {
      code: 'user.suggest_mfa',
      message: 'MFA suggested',
      data: { trustedDevice: { canCreate: true, durationDays: 30 } },
    };

    await act(async () => {
      await result.current['user.suggest_mfa']?.(error);
    });

    expect(mockedNavigate).toHaveBeenCalledWith(
      { pathname: '/mfa-onboarding' },
      {
        replace: undefined,
        state: { trustedDevice: { canCreate: true, durationDays: 30 } },
      }
    );
  });
});
