import { type LogtoErrorCode } from '@logto/phrases';
import { type RequestErrorBody } from '@logto/schemas';
import { act, renderHook } from '@testing-library/react';

import useStepUpErrorHandler from './use-step-up-error-handler';

const mockedNavigate = jest.fn();

jest.mock('./use-navigate-with-preserved-search-params', () => ({
  __esModule: true,
  default: () => mockedNavigate,
}));

const buildError = (code: LogtoErrorCode): RequestErrorBody => ({
  code,
  message: `Server message for ${code}`,
  data: {},
});

describe('useStepUpErrorHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each<LogtoErrorCode>([
    'session.interaction_not_found',
    'session.step_up.subject_not_found',
    'session.identity_conflict',
    'session.step_up.forbidden_route',
  ])('replaces the current entry with the invalid-session page on %s', async (code) => {
    const { result } = renderHook(() => useStepUpErrorHandler());
    const handler = result.current[code];

    expect(handler).toBeDefined();

    await act(async () => {
      await handler?.(buildError(code));
    });

    expect(mockedNavigate).toHaveBeenCalledTimes(1);
    expect(mockedNavigate).toHaveBeenCalledWith('/unknown-session', { replace: true });
  });

  it('sends the user back to the step-up landing when the selected class is not satisfied', async () => {
    const { result } = renderHook(() => useStepUpErrorHandler());
    const handler = result.current['session.step_up.acr_not_satisfied'];

    expect(handler).toBeDefined();

    await act(async () => {
      await handler?.(buildError('session.step_up.acr_not_satisfied'));
    });

    expect(mockedNavigate).toHaveBeenCalledTimes(1);
    expect(mockedNavigate).toHaveBeenCalledWith('/step-up', { replace: true });
  });

  it.each<LogtoErrorCode>([
    'session.verification_blocked_too_many_attempts',
    'session.mfa.require_mfa_verification',
  ])('leaves %s to its existing handling', (code) => {
    const { result } = renderHook(() => useStepUpErrorHandler());

    expect(result.current).not.toHaveProperty(code);
    expect(result.current[code]).toBeUndefined();
  });

  it('only registers the step-up specific codes and no global fallback', () => {
    const { result } = renderHook(() => useStepUpErrorHandler());

    expect(new Set(Object.keys(result.current))).toEqual(
      new Set([
        'session.identity_conflict',
        'session.interaction_not_found',
        'session.step_up.acr_not_satisfied',
        'session.step_up.forbidden_route',
        'session.step_up.subject_not_found',
      ])
    );
    expect(result.current.global).toBeUndefined();
  });

  it('returns the same handlers object across rerenders', () => {
    const { result, rerender } = renderHook(() => useStepUpErrorHandler());
    const firstResult = result.current;

    rerender();

    expect(result.current).toBe(firstResult);
  });
});
