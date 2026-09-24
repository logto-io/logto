import { act, renderHook } from '@testing-library/react';

import useWebhookTestResult from './use-webhook-test-result';

jest.mock('@/consts', () => ({
  storageKeys: { webhookTestResult: 'logto:admin_console:webhook_test_result' },
}));

const getStorageKey = (hookId: string) => `logto:admin_console:webhook_test_result:${hookId}`;

const testResult = {
  result: 'success' as const,
  endpointUrl: 'https://example.com/webhook',
  requestTime: 0,
};

describe('useWebhookTestResult', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('persists and clears the result for the matching hook', () => {
    const { result } = renderHook(() => useWebhookTestResult('hook-a'));

    expect(result.current.result).toBeUndefined();

    act(() => {
      result.current.setResult(testResult);
    });

    expect(result.current.result).toEqual(testResult);
    expect(sessionStorage.getItem(getStorageKey('hook-a'))).toBe(JSON.stringify(testResult));

    act(() => {
      result.current.setResult(undefined);
    });

    expect(result.current.result).toBeUndefined();
    expect(sessionStorage.getItem(getStorageKey('hook-a'))).toBeNull();
  });

  it('does not show the result of another hook', () => {
    const { result } = renderHook(() => useWebhookTestResult('hook-a'));

    act(() => {
      result.current.setResult(testResult);
    });

    const { result: anotherHookResult } = renderHook(() => useWebhookTestResult('hook-b'));

    expect(anotherHookResult.current.result).toBeUndefined();
  });

  it('reads the persisted result for the same hook', () => {
    sessionStorage.setItem(getStorageKey('hook-a'), JSON.stringify(testResult));

    const { result } = renderHook(() => useWebhookTestResult('hook-a'));

    expect(result.current.result).toEqual(testResult);
  });
});
