import { useHandleSignInCallback, useLogto } from '@logto/react';

import Callback from './Callback';
import renderWithPageContext from './__mocks__/RenderWithPageContext';
import { accountStorage } from './utils/session-storage';
import { startPendingStepUp } from './utils/step-up';

jest.mock('@logto/react', () => ({
  __esModule: true,
  useLogto: jest.fn(),
  useHandleSignInCallback: jest.fn(),
}));

describe('<Callback />', () => {
  const clearAllTokens = jest.fn();

  beforeEach(() => {
    (useLogto as jest.Mock).mockReturnValue({ clearAllTokens });
    (useHandleSignInCallback as jest.Mock).mockReturnValue({ error: undefined });
  });

  afterEach(() => {
    jest.clearAllMocks();
    window.sessionStorage.clear();
  });

  it('clears stale tokens on mount, preserving the cleanup invariant for the silent re-auth callback', () => {
    renderWithPageContext(<Callback />);

    expect(clearAllTokens).toHaveBeenCalledTimes(1);
  });

  it('renders an error UI when useHandleSignInCallback reports an error', () => {
    (useHandleSignInCallback as jest.Mock).mockReturnValue({ error: new Error('boom') });

    const { getByText } = renderWithPageContext(<Callback />);

    expect(getByText(/couldn't complete the sign in callback/i)).toBeTruthy();
  });

  it('marks a pending step-up authorized once the callback succeeds', () => {
    const replace = jest.fn();
    jest.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, replace });
    startPendingStepUp({ type: 'remove-username' }, '/account/security');
    (useHandleSignInCallback as jest.Mock).mockImplementation((callback: () => void) => {
      callback();
      return { error: undefined };
    });

    renderWithPageContext(<Callback />);

    expect(accountStorage.pendingStepUp.get()).toMatchObject({ phase: 'authorized' });
    expect(replace).toHaveBeenCalledWith('/account');
  });

  it('discards a pending step-up when the callback fails', () => {
    startPendingStepUp({ type: 'remove-username' }, '/account/security');
    (useHandleSignInCallback as jest.Mock).mockReturnValue({ error: new Error('state mismatch') });

    renderWithPageContext(<Callback />);

    expect(accountStorage.pendingStepUp.get()).toBeUndefined();
  });
});
