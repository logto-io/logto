import { type SsoConnectorMetadata } from '@logto/schemas';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useContext } from 'react';

import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';

import useCheckSingleSignOn from './use-check-single-sign-on';

const getSsoConnectorsMock = jest.fn();

jest.mock('@/apis/experience', () => ({
  getSsoConnectors: (email: string) => getSsoConnectorsMock(email),
}));

jest.mock('@/hooks/use-single-sign-on', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn()),
}));

const email = 'user@example.com';

const publicConnector: SsoConnectorMetadata = {
  id: 'sso-connector',
  connectorName: 'OIDC',
  logo: 'https://logto.io/provider-logo.png',
  darkLogo: 'https://logto.io/provider-dark-logo.png',
};

const brandedConnector: SsoConnectorMetadata = {
  id: publicConnector.id,
  connectorName: 'Acme SSO',
  logo: 'https://acme.example.com/logo.png',
  darkLogo: 'https://acme.example.com/dark-logo.png',
};

const CheckSingleSignOnProbe = () => {
  const { onSubmit } = useCheckSingleSignOn();
  const { ssoConnectors } = useContext(UserInteractionContext);

  const handleCheck = async () => {
    await onSubmit(email);
  };

  return (
    <>
      <button type="button" onClick={handleCheck}>
        check
      </button>
      <span data-testid="sso-connectors">{JSON.stringify(ssoConnectors)}</span>
    </>
  );
};

const renderProbe = () =>
  renderWithPageContext(
    <SettingsProvider
      settings={{
        ...mockSignInExperienceSettings,
        ssoConnectors: [publicConnector],
      }}
    >
      <UserInteractionContextProvider>
        <CheckSingleSignOnProbe />
      </UserInteractionContextProvider>
    </SettingsProvider>
  );

const getStoredConnectors = () =>
  JSON.parse(screen.getByTestId('sso-connectors').textContent ?? '[]') as SsoConnectorMetadata[];

describe('useCheckSingleSignOn', () => {
  afterEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it('stores the branded connectors returned by the email lookup', async () => {
    getSsoConnectorsMock.mockResolvedValueOnce({
      connectorIds: [brandedConnector.id],
      connectors: [brandedConnector],
    });

    renderProbe();

    // Before the lookup matches a domain, the public catalog is not copied into the interaction context.
    expect(getStoredConnectors()).toEqual([]);

    fireEvent.click(screen.getByText('check'));

    await waitFor(() => {
      expect(getSsoConnectorsMock).toBeCalledWith(email);
      expect(getStoredConnectors()).toEqual([brandedConnector]);
    });
  });

  it('falls back to connector IDs and the public catalog for older servers', async () => {
    getSsoConnectorsMock.mockResolvedValueOnce({
      connectorIds: [publicConnector.id],
    });

    renderProbe();
    fireEvent.click(screen.getByText('check'));

    await waitFor(() => {
      expect(getStoredConnectors()).toEqual([publicConnector]);
    });
  });
});
