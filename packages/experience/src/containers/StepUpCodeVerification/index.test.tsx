import { SignInIdentifier, VerificationType } from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { cloneElement, type ReactElement, type ReactNode } from 'react';

import UserInteractionContext, {
  type UserInteractionContextType,
} from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { sendStepUpVerificationCode, verifyStepUpVerificationCode } from '@/apis/experience';
import { type ErrorHandlers } from '@/hooks/use-error-handler';
import { type VerificationCodeIdentifier } from '@/types';

import StepUpCodeVerification from '.';

const mockedHandleError = jest.fn<Promise<void>, [unknown, ErrorHandlers?]>();
const mockedRedirectTo = jest.fn();
const mockedNavigate = jest.fn();
const mockedSetToast = jest.fn();
const mockedSetVerificationId = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { dir: () => 'ltr' },
  }),
  // Render the interpolated component, so the resend link keeps its click handler.
  Trans: ({
    children,
    components,
  }: {
    readonly children: ReactNode;
    readonly components?: Record<string, ReactElement>;
  }) => (components?.a ? cloneElement(components.a, {}, children) : children),
}));

jest.mock('@/hooks/use-navigate-with-preserved-search-params', () => ({
  ...jest.requireActual('@/hooks/use-navigate-with-preserved-search-params'),
  __esModule: true,
  default: () => mockedNavigate,
}));

jest.mock('@/hooks/use-error-handler', () => ({
  __esModule: true,
  default: () => mockedHandleError,
}));

jest.mock('@/hooks/use-global-redirect-to', () => ({
  __esModule: true,
  default: () => mockedRedirectTo,
}));

jest.mock('@/hooks/use-toast', () => ({
  __esModule: true,
  default: () => ({ setToast: mockedSetToast }),
}));

/**
 * The shared code input is exercised by its own tests; here it only has to report a code, so the
 * container's own behavior — what it sends, and against which record — is what the tests read.
 */
jest.mock('@/shared/components/VerificationCode', () => ({
  __esModule: true,
  defaultLength: 6,
  default: ({
    error,
    onChange,
  }: {
    readonly error?: string;
    readonly onChange: (code: string[]) => void;
  }) => (
    <>
      <button
        type="button"
        onClick={() => {
          onChange(['1', '2', '3', '4', '5', '6']);
        }}
      >
        Fill code
      </button>
      <button
        type="button"
        onClick={() => {
          onChange(['1', '2', '3']);
        }}
      >
        Fill partial code
      </button>
      {error && <div>{error}</div>}
    </>
  ),
}));

/** The resend countdown starts on mount; stop it so the resend link is always reachable. */
jest.mock('react-timer-hook', () => ({
  useTimer: () => ({ seconds: 0, isRunning: false, restart: jest.fn() }),
}));

jest.mock('@/apis/experience', () => ({
  ...jest.requireActual('@/apis/experience'),
  sendStepUpVerificationCode: jest.fn(),
  verifyStepUpVerificationCode: jest.fn(),
}));

const mockedSendStepUpVerificationCode = sendStepUpVerificationCode as jest.MockedFunction<
  typeof sendStepUpVerificationCode
>;
const mockedVerifyStepUpVerificationCode = verifyStepUpVerificationCode as jest.MockedFunction<
  typeof verifyStepUpVerificationCode
>;

/** The codes `useStepUpErrorHandler` contributes; every step-up call composes them. */
const stepUpErrorCodes = [
  'session.not_found',
  'session.interaction_not_found',
  'session.step_up.subject_not_found',
  'session.step_up.invalid_interaction_event',
  'session.identity_conflict',
  'session.step_up.forbidden_route',
  'session.step_up.acr_not_satisfied',
];

const userInteractionContext: UserInteractionContextType = {
  availableSsoConnectorsMap: new Map(),
  setSsoEmail: noop,
  ssoConnectors: [],
  setSsoConnectors: noop,
  setIdentifierInputValue: noop,
  setForgotPasswordIdentifierInputValue: noop,
  setVerificationId: mockedSetVerificationId,
  verificationIdsMap: {},
  hasBoundPasskey: false,
  setHasBoundPasskey: noop,
  clearInteractionContextSessionStorage: noop,
};

const renderContainer = (identifierType: VerificationCodeIdentifier = SignInIdentifier.Email) =>
  renderWithPageContext(
    <UserInteractionContext.Provider value={userInteractionContext}>
      <StepUpCodeVerification identifierType={identifierType} verificationId="sent-id" />
    </UserInteractionContext.Provider>
  );

const enterCode = async (label = 'Fill code') => {
  await act(async () => {
    fireEvent.click(screen.getByText(label));
  });
};

describe('<StepUpCodeVerification />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('offers no switch to another identifier or to a password', () => {
    renderContainer();

    // The method list is where the user switches; this page is pinned to one identifier.
    expect(screen.queryByText('action.sign_in_via_password')).toBeNull();
    expect(screen.queryByText('action.sign_in_via_passcode')).toBeNull();
  });

  it.each([SignInIdentifier.Email, SignInIdentifier.Phone] as const)(
    'verifies the %s code by identifier type only and follows the redirect',
    async (identifierType) => {
      mockedVerifyStepUpVerificationCode.mockResolvedValueOnce({
        redirectTo: 'https://logto.io/callback',
      });
      renderContainer(identifierType);

      await enterCode();

      await waitFor(() => {
        expect(mockedRedirectTo).toHaveBeenCalledWith('https://logto.io/callback');
      });
      expect(mockedVerifyStepUpVerificationCode).toHaveBeenCalledTimes(1);
      // No raw identifier: the type and the verification ID are the whole payload.
      expect(mockedVerifyStepUpVerificationCode).toHaveBeenCalledWith({
        type: identifierType,
        code: '123456',
        verificationId: 'sent-id',
      });
      expect(mockedHandleError).not.toHaveBeenCalled();
    }
  );

  it('shows an input error and does not verify an incomplete code', async () => {
    renderContainer();

    await enterCode('Fill partial code');

    await act(async () => {
      fireEvent.click(screen.getByText('action.continue'));
    });

    expect(mockedVerifyStepUpVerificationCode).not.toHaveBeenCalled();
    expect(screen.getByText('error.invalid_passcode')).not.toBeNull();
  });

  it('hands a failed verification to the error handler with the step-up handlers', async () => {
    const error = new Error('Code mismatch');
    mockedVerifyStepUpVerificationCode.mockRejectedValueOnce(error);
    renderContainer();

    await enterCode();

    await waitFor(() => {
      expect(mockedHandleError).toHaveBeenCalledTimes(1);
    });

    const [handledError, errorHandlers] = mockedHandleError.mock.calls[0] ?? [];
    expect(handledError).toBe(error);
    expect(Object.keys(errorHandlers ?? {})).toEqual(
      expect.arrayContaining([
        // A wrong or expired code is shown on the input rather than toasted.
        'verification_code.code_mismatch',
        'verification_code.expired',
        ...stepUpErrorCodes,
        // What a sign-in with requested ACR may still need after this factor.
        'session.mfa.require_mfa_verification',
        'user.missing_profile',
      ])
    );
    expect(mockedRedirectTo).not.toHaveBeenCalled();
  });

  it.each([SignInIdentifier.Email, SignInIdentifier.Phone] as const)(
    'resends the %s code by identifier type only and verifies against the new record',
    async (identifierType) => {
      mockedSendStepUpVerificationCode.mockResolvedValueOnce({ verificationId: 'resent-id' });
      mockedVerifyStepUpVerificationCode.mockResolvedValueOnce({
        redirectTo: 'https://logto.io/callback',
      });
      renderContainer(identifierType);

      await act(async () => {
        fireEvent.click(screen.getByText('description.resend_passcode'));
      });

      expect(mockedSendStepUpVerificationCode).toHaveBeenCalledTimes(1);
      expect(mockedSendStepUpVerificationCode).toHaveBeenCalledWith(identifierType);
      // The stored id is renewed, so a refresh verifies against the code that was sent last.
      expect(mockedSetVerificationId).toHaveBeenCalledWith(
        identifierType === SignInIdentifier.Email
          ? VerificationType.EmailVerificationCode
          : VerificationType.PhoneVerificationCode,
        'resent-id'
      );
      expect(mockedSetToast).toHaveBeenCalledWith('description.passcode_sent');

      await enterCode();

      await waitFor(() => {
        expect(mockedVerifyStepUpVerificationCode).toHaveBeenCalledWith({
          type: identifierType,
          code: '123456',
          verificationId: 'resent-id',
        });
      });
    }
  );

  it('hands a failed resend to the error handler with the step-up handlers and keeps the old id', async () => {
    const error = new Error('Failed to send the code');
    mockedSendStepUpVerificationCode.mockRejectedValueOnce(error);
    renderContainer();

    await act(async () => {
      fireEvent.click(screen.getByText('description.resend_passcode'));
    });

    expect(mockedHandleError).toHaveBeenCalledTimes(1);
    const [handledError, errorHandlers] = mockedHandleError.mock.calls[0] ?? [];
    expect(handledError).toBe(error);
    expect(new Set(Object.keys(errorHandlers ?? {}))).toEqual(new Set(stepUpErrorCodes));
    expect(mockedSetVerificationId).not.toHaveBeenCalled();

    mockedVerifyStepUpVerificationCode.mockResolvedValueOnce({ redirectTo: 'https://logto.io' });
    await enterCode();

    await waitFor(() => {
      expect(mockedVerifyStepUpVerificationCode).toHaveBeenCalledWith({
        type: SignInIdentifier.Email,
        code: '123456',
        verificationId: 'sent-id',
      });
    });
  });
});
