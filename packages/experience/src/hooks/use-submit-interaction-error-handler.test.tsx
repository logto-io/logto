import { InteractionEvent, type RequestErrorBody } from '@logto/schemas';
import { act, renderHook } from '@testing-library/react';

import { type ErrorHandlers } from './use-error-handler';
import useSubmitInteractionErrorHandler from './use-submit-interaction-error-handler';

const mockedNavigate = jest.fn();

const mockRequiredProfileHandler = jest.fn();
const mockMfaHandler = jest.fn();
const mockEmailBlockedHandler = jest.fn();
const mockMissingPasskeyHandler = jest.fn();
const mockTrustedDeviceOptInHandler = jest.fn();

/**
 * Stable marker objects so that the memoized result of the hook under test only changes when one
 * of the composed handlers actually changes.
 */
const mockRequiredProfileHandlers: ErrorHandlers = {
  'user.missing_profile': mockRequiredProfileHandler,
};
const mockMfaHandlers: ErrorHandlers = {
  'user.missing_mfa': mockMfaHandler,
};
const mockEmailBlockedHandlers: ErrorHandlers = {
  'session.email_blocklist.email_not_allowed': mockEmailBlockedHandler,
};
const mockMissingPasskeyHandlers: ErrorHandlers = {
  'user.passkey_preferred': mockMissingPasskeyHandler,
};
const mockTrustedDeviceOptInHandlers: ErrorHandlers = {
  'session.trusted_device_suggest_opt_in': mockTrustedDeviceOptInHandler,
};

const mockUseRequiredProfileErrorHandler = jest.fn<ErrorHandlers, unknown[]>(
  () => mockRequiredProfileHandlers
);
const mockUseMfaErrorHandler = jest.fn<ErrorHandlers, unknown[]>(() => mockMfaHandlers);
const mockUseEmailBlockedErrorHandler = jest.fn<ErrorHandlers, unknown[]>(
  () => mockEmailBlockedHandlers
);
const mockUseMissingPasskeyErrorHandler = jest.fn<ErrorHandlers, unknown[]>(
  () => mockMissingPasskeyHandlers
);
const mockUseTrustedDeviceOptInErrorHandler = jest.fn<ErrorHandlers, unknown[]>(
  () => mockTrustedDeviceOptInHandlers
);

jest.mock('./use-navigate-with-preserved-search-params', () => ({
  __esModule: true,
  default: () => mockedNavigate,
}));

jest.mock('./use-required-profile-error-handler', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseRequiredProfileErrorHandler(...args),
}));

jest.mock('./use-mfa-error-handler', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseMfaErrorHandler(...args),
}));

jest.mock('./use-email-blocked-error-handler', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseEmailBlockedErrorHandler(...args),
}));

jest.mock('./use-missing-passkey-error-handler', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseMissingPasskeyErrorHandler(...args),
}));

jest.mock('./use-trusted-device-opt-in-error-handler', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseTrustedDeviceOptInErrorHandler(...args),
}));

describe('useSubmitInteractionErrorHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to the step-up landing with nothing in the location state on require_verification', async () => {
    const { result } = renderHook(() => useSubmitInteractionErrorHandler(InteractionEvent.SignIn));
    const handler = result.current['session.step_up.require_verification'];
    const error: RequestErrorBody = {
      code: 'session.step_up.require_verification',
      message: 'Verification is required.',
      data: { availableMethods: ['Password'], futureField: 'ignored' },
    };

    expect(handler).toBeDefined();

    await act(async () => {
      await handler?.(error);
    });

    expect(mockedNavigate).toHaveBeenCalledTimes(1);
    expect(mockedNavigate).toHaveBeenCalledWith('/step-up', { replace: true });
    // The navigation must be exactly `(landing, { replace: true })`: nothing from the error is
    // carried in `location.state`, so the continuation is refresh-safe.
    expect(mockedNavigate.mock.calls[0]).toHaveLength(2);
    expect(mockedNavigate.mock.calls[0]?.[1]).toStrictEqual({ replace: true });
  });

  it('keeps the composed handlers of the sibling hooks', () => {
    const { result } = renderHook(() => useSubmitInteractionErrorHandler(InteractionEvent.SignIn));

    expect(result.current['user.missing_profile']).toBe(mockRequiredProfileHandler);
    expect(result.current['user.missing_mfa']).toBe(mockMfaHandler);
    expect(result.current['session.email_blocklist.email_not_allowed']).toBe(
      mockEmailBlockedHandler
    );
    expect(result.current['user.passkey_preferred']).toBe(mockMissingPasskeyHandler);
    expect(result.current['session.trusted_device_suggest_opt_in']).toBe(
      mockTrustedDeviceOptInHandler
    );
    expect(typeof result.current['session.step_up.require_verification']).toBe('function');
    expect(new Set(Object.keys(result.current))).toEqual(
      new Set([
        'session.email_blocklist.email_not_allowed',
        'session.step_up.require_verification',
        'session.trusted_device_suggest_opt_in',
        'user.missing_mfa',
        'user.missing_profile',
        'user.passkey_preferred',
      ])
    );
  });

  it('forwards the interaction event and options to the sibling hooks', () => {
    const onEmailBlocked = jest.fn();

    renderHook(() =>
      useSubmitInteractionErrorHandler(InteractionEvent.Register, {
        replace: true,
        linkSocial: 'github',
        onEmailBlocked,
      })
    );

    expect(mockUseRequiredProfileErrorHandler).toHaveBeenCalledWith({
      replace: true,
      linkSocial: 'github',
      interactionEvent: InteractionEvent.Register,
    });
    expect(mockUseMfaErrorHandler).toHaveBeenCalledWith({ replace: true });
    expect(mockUseEmailBlockedErrorHandler).toHaveBeenCalledWith({ onConfirm: onEmailBlocked });
    expect(mockUseMissingPasskeyErrorHandler).toHaveBeenCalledWith(InteractionEvent.Register);
    expect(mockUseTrustedDeviceOptInErrorHandler).toHaveBeenCalledWith(InteractionEvent.Register);
  });

  it('returns a referentially stable handlers object when the inputs do not change', () => {
    const { result, rerender } = renderHook(() =>
      useSubmitInteractionErrorHandler(InteractionEvent.SignIn)
    );
    const firstResult = result.current;

    rerender();
    rerender();

    expect(result.current).toBe(firstResult);
  });

  it('recomputes the handlers when a composed handler changes', () => {
    const { result, rerender } = renderHook(() =>
      useSubmitInteractionErrorHandler(InteractionEvent.SignIn)
    );
    const firstResult = result.current;
    const replacementMfaHandler = jest.fn();
    const replacementMfaHandlers: ErrorHandlers = { 'user.missing_mfa': replacementMfaHandler };

    mockUseMfaErrorHandler.mockReturnValueOnce(replacementMfaHandlers);
    rerender();

    expect(result.current).not.toBe(firstResult);
    expect(result.current['user.missing_mfa']).toBe(replacementMfaHandler);
    // Untouched siblings are still spread into the recomputed object.
    expect(result.current['user.missing_profile']).toBe(mockRequiredProfileHandler);
  });
});
