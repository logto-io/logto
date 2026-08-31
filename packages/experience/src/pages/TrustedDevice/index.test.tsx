import { InteractionEvent } from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { setTrustedDeviceOptInDecision } from '@/apis/experience';

import TrustedDevice from '.';

const mockRedirectTo = jest.fn();

jest.mock('@/apis/experience', () => ({
  setTrustedDeviceOptInDecision: jest.fn(async () => ({ redirectTo: '/redirect' })),
}));

jest.mock('@/hooks/use-global-redirect-to', () => ({
  __esModule: true,
  default: () => mockRedirectTo,
}));

const mockedSetTrustedDeviceOptInDecision = setTrustedDeviceOptInDecision as jest.MockedFunction<
  typeof setTrustedDeviceOptInDecision
>;

const renderPage = (state?: { durationDays: number; interactionEvent: InteractionEvent.SignIn }) =>
  renderWithPageContext(
    <SettingsProvider>
      <TrustedDevice />
    </SettingsProvider>,
    { initialEntries: [{ pathname: '/trusted-device', state }] }
  );

describe('<TrustedDevice />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('submits an accepted decision and redirects', async () => {
    const { getAllByText } = renderPage({
      durationDays: 30,
      interactionEvent: InteractionEvent.SignIn,
    });

    fireEvent.click(getAllByText('mfa.trust_this_device')[1]!);

    await waitFor(() => {
      expect(mockedSetTrustedDeviceOptInDecision).toHaveBeenCalledWith(true);
      expect(mockRedirectTo).toHaveBeenCalledWith('/redirect');
    });
  });

  it('submits a skipped decision and redirects', async () => {
    const { getByText } = renderPage({
      durationDays: 30,
      interactionEvent: InteractionEvent.SignIn,
    });

    fireEvent.click(getByText('action.nav_skip'));

    await waitFor(() => {
      expect(mockedSetTrustedDeviceOptInDecision).toHaveBeenCalledWith(false);
      expect(mockRedirectTo).toHaveBeenCalledWith('/redirect');
    });
  });

  it('shows an invalid-session error without route state', () => {
    const { queryByText } = renderPage();

    expect(queryByText('error.invalid_session')).not.toBeNull();
    expect(mockedSetTrustedDeviceOptInDecision).not.toHaveBeenCalled();
  });
});
