import { renderHook } from '@testing-library/react';

import { getCallbackLinkFromStorage, storeCallbackLink } from '@/utils/social-connectors';

import useSocialCallbackHandler from './use-social-callback-handler';

const navigate = jest.fn();

jest.mock('@/hooks/use-navigate-with-preserved-search-params', () => ({
  __esModule: true,
  default: () => navigate,
}));

describe('useSocialCallbackHandler', () => {
  const replace = jest.fn();
  const originalLocation = window.location;
  const connectorId = 'github';
  const search = '?code=auth-code&state=state-value';

  const invoke = () => {
    const { result } = renderHook(() => useSocialCallbackHandler());
    result.current.socialCallbackHandler(connectorId);
  };

  beforeEach(() => {
    replace.mockClear();
    navigate.mockClear();
    sessionStorage.clear();

    /* eslint-disable @silverhand/fp/no-mutating-methods */
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { origin: 'http://localhost', search, hash: '', replace },
    });
    /* eslint-enable @silverhand/fp/no-mutating-methods */
  });

  afterAll(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    Object.defineProperty(window, 'location', { value: originalLocation });
  });

  it('forwards the callback parameters to a native deep link', () => {
    storeCallbackLink(connectorId, 'logto://callback');
    invoke();

    expect(replace).toBeCalledWith(new URL(`logto://callback${search}`));
    expect(navigate).not.toBeCalled();
  });

  it.each([
    'https://attacker.example',
    // eslint-disable-next-line no-script-url -- payload under test
    'javascript:alert(1)',
    'not a url',
  ])('takes the web flow rather than forwarding to %p', (poisoned) => {
    storeCallbackLink(connectorId, poisoned);
    invoke();

    expect(replace).not.toBeCalled();
    expect(navigate).toBeCalledWith(
      { pathname: `/callback/social/${connectorId}`, search },
      { replace: true }
    );
  });

  it('clears the stored callback link once read', () => {
    storeCallbackLink(connectorId, 'logto://callback');
    invoke();

    expect(getCallbackLinkFromStorage(connectorId)).toBeNull();
  });
});
