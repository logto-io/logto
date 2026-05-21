import { useHandleSignInCallback, useLogto } from '@logto/react';

import Callback from './Callback';
import { clearVerificationRecord } from './Providers/PageContextProvider/verification-storage';
import renderWithPageContext from './__mocks__/RenderWithPageContext';

jest.mock('@logto/react', () => ({
  __esModule: true,
  useLogto: jest.fn(),
  useHandleSignInCallback: jest.fn(),
}));

jest.mock('./Providers/PageContextProvider/verification-storage', () => ({
  __esModule: true,
  clearVerificationRecord: jest.fn(),
}));

describe('<Callback />', () => {
  const clearAllTokens = jest.fn();

  beforeEach(() => {
    (useLogto as jest.Mock).mockReturnValue({ clearAllTokens });
    (useHandleSignInCallback as jest.Mock).mockReturnValue({ error: undefined });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('clears stale tokens and verification record on mount, preserving the cleanup invariant for the silent re-auth callback', () => {
    renderWithPageContext(<Callback />);

    expect(clearAllTokens).toHaveBeenCalledTimes(1);
    expect(clearVerificationRecord).toHaveBeenCalledTimes(1);
  });

  it('renders an error UI when useHandleSignInCallback reports an error', () => {
    (useHandleSignInCallback as jest.Mock).mockReturnValue({ error: new Error('boom') });

    const { getByText } = renderWithPageContext(<Callback />);

    expect(getByText(/couldn't complete the sign in callback/i)).toBeTruthy();
  });
});
