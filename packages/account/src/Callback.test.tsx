import { useHandleSignInCallback } from '@logto/react';

import Callback from './Callback';
import { clearVerificationRecord } from './Providers/PageContextProvider/verification-storage';
import renderWithPageContext from './__mocks__/RenderWithPageContext';
import { accountStorage } from './utils/session-storage';
import { startPendingStepUp } from './utils/step-up';

jest.mock('@logto/react', () => ({
  __esModule: true,
  useHandleSignInCallback: jest.fn(),
}));

jest.mock('./Providers/PageContextProvider/verification-storage', () => ({
  __esModule: true,
  clearVerificationRecord: jest.fn(),
}));

describe('<Callback />', () => {
  beforeEach(() => {
    (useHandleSignInCallback as jest.Mock).mockReturnValue({ error: undefined });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    window.sessionStorage.clear();
  });

  it('renders an error UI when useHandleSignInCallback reports an error without clearing the verification record', () => {
    (useHandleSignInCallback as jest.Mock).mockReturnValue({ error: new Error('boom') });

    const { getByText } = renderWithPageContext(<Callback />);

    expect(getByText(/couldn't complete the sign in callback/i)).toBeTruthy();
    expect(clearVerificationRecord).not.toHaveBeenCalled();
  });

  it('clears the verification record and marks a pending step-up authorized once the callback succeeds', () => {
    const replace = jest.fn();
    jest.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, replace });
    startPendingStepUp({ type: 'remove-username' }, '/account/security');
    (useHandleSignInCallback as jest.Mock).mockImplementation((callback: () => void) => {
      callback();
      return { error: undefined };
    });

    renderWithPageContext(<Callback />);

    expect(clearVerificationRecord).toHaveBeenCalledTimes(1);
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
