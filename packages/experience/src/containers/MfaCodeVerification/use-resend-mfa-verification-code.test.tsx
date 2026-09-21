import { SignInIdentifier, VerificationType } from '@logto/schemas';
import { act, renderHook } from '@testing-library/react';
import { useContext } from 'react';

import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { StorageKeys } from '@/hooks/use-session-storages';

import useResendMfaVerificationCode from './use-resend-mfa-verification-code';

const resend = jest.fn();
const handleError = jest.fn();

jest.mock('@/hooks/use-api', () => ({
  __esModule: true,
  default: () => resend,
}));

jest.mock('@/hooks/use-error-handler', () => ({
  __esModule: true,
  default: () => handleError,
}));

jest.mock('@/hooks/use-step-up-error-handler', () => ({
  __esModule: true,
  default: () => jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  __esModule: true,
  default: () => ({ setToast: jest.fn() }),
}));

jest.mock('@/hooks/use-sie', () => ({
  useSieMethods: () => ({ ssoConnectors: [] }),
}));

const storageKey = `logto:${window.location.origin}:${StorageKeys.verificationIds}`;
const previousIds = {
  [VerificationType.EmailVerificationCode]: 'previous-email-id',
  [VerificationType.PhoneVerificationCode]: 'previous-phone-id',
};

describe('useResendMfaVerificationCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.setItem(storageKey, JSON.stringify(previousIds));
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it.each([
    [SignInIdentifier.Email, VerificationType.EmailVerificationCode],
    [SignInIdentifier.Phone, VerificationType.PhoneVerificationCode],
  ] as const)(
    'persists the resent %s MFA verification ID across refresh',
    async (identifier, type) => {
      resend.mockResolvedValue([undefined, { verificationId: 'resent-id' }]);
      const { result, unmount } = renderHook(() => useResendMfaVerificationCode(identifier), {
        wrapper: UserInteractionContextProvider,
      });

      await act(async () => {
        expect(await result.current.onResendVerificationCode()).toBe('resent-id');
      });

      expect(resend).toHaveBeenCalledWith(identifier);
      const expectedIds = { ...previousIds, [type]: 'resent-id' };
      expect(JSON.parse(sessionStorage.getItem(storageKey) ?? '{}')).toEqual(expectedIds);
      unmount();

      const refreshed = renderHook(() => useContext(UserInteractionContext), {
        wrapper: UserInteractionContextProvider,
      });
      expect(refreshed.result.current.verificationIdsMap).toEqual(expectedIds);
    }
  );

  it('preserves the previous verification IDs when resend fails', async () => {
    const error = { code: 'connector.general', message: 'Unable to send code' };
    resend.mockResolvedValue([error]);
    const { result } = renderHook(() => useResendMfaVerificationCode(SignInIdentifier.Email), {
      wrapper: UserInteractionContextProvider,
    });

    await act(async () => {
      expect(await result.current.onResendVerificationCode()).toBeUndefined();
    });

    expect(handleError).toHaveBeenCalledTimes(1);
    expect(handleError.mock.calls[0]?.[0]).toBe(error);
    expect(JSON.parse(sessionStorage.getItem(storageKey) ?? '{}')).toEqual(previousIds);
  });
});
