import { type SsoConnectorMetadata } from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import { screen } from '@testing-library/react';

import UserInteractionContext, {
  type UserInteractionContextType,
} from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';

import useConnectors from './use-connectors';

const connectorId = 'sso-connector';

const publicConnector: SsoConnectorMetadata = {
  id: connectorId,
  connectorName: 'OIDC',
  logo: 'https://logto.io/provider-logo.png',
  darkLogo: 'https://logto.io/provider-dark-logo.png',
};

const brandedConnector: SsoConnectorMetadata = {
  id: connectorId,
  connectorName: 'Acme SSO',
  logo: 'https://acme.example.com/logo.png',
  darkLogo: 'https://acme.example.com/dark-logo.png',
};

const createUserInteractionContext = (
  ssoConnectors: SsoConnectorMetadata[]
): UserInteractionContextType => ({
  availableSsoConnectorsMap: new Map(ssoConnectors.map((connector) => [connector.id, connector])),
  ssoConnectors,
  setSsoEmail: noop,
  setSsoConnectors: noop,
  setIdentifierInputValue: noop,
  setForgotPasswordIdentifierInputValue: noop,
  setVerificationId: noop,
  verificationIdsMap: {},
  hasBoundPasskey: false,
  setHasBoundPasskey: noop,
  clearInteractionContextSessionStorage: noop,
});

const ConnectorProbe = () => {
  const { findConnectorById, getConnectorLogo } = useConnectors();
  const result = findConnectorById(connectorId);

  return (
    <>
      <span data-testid="connector-name">
        {result?.type === 'sso' ? result.connector.connectorName : ''}
      </span>
      <span data-testid="connector-logo">{result ? getConnectorLogo(result) : ''}</span>
    </>
  );
};

const renderProbe = (matchedConnectors: SsoConnectorMetadata[]) =>
  renderWithPageContext(
    <SettingsProvider
      settings={{
        ...mockSignInExperienceSettings,
        ssoConnectors: [publicConnector],
      }}
    >
      <UserInteractionContext.Provider value={createUserInteractionContext(matchedConnectors)}>
        <ConnectorProbe />
      </UserInteractionContext.Provider>
    </SettingsProvider>
  );

describe('useConnectors', () => {
  it('prefers the matched connector branding from the interaction context', () => {
    renderProbe([brandedConnector]);

    expect(screen.getByTestId('connector-name').textContent).toBe(brandedConnector.connectorName);
    expect(screen.getByTestId('connector-logo').textContent).toBe(brandedConnector.logo);
  });

  it('falls back to the public catalog before an email domain matches', () => {
    renderProbe([]);

    expect(screen.getByTestId('connector-name').textContent).toBe(publicConnector.connectorName);
    expect(screen.getByTestId('connector-logo').textContent).toBe(publicConnector.logo);
  });
});
