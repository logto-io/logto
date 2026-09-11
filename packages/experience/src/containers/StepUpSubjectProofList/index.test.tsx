import { type SsoConnectorMetadata, type SubjectProofConnector } from '@logto/schemas';
import { act, fireEvent, screen, within } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings, socialConnectors } from '@/__mocks__/logto';
import { type SignInExperienceResponse } from '@/types';

import StepUpSubjectProofList from '.';

const mockedInvokeSocialSignIn = jest.fn();
const mockedInvokeSso = jest.fn();

jest.mock('@/containers/SocialSignInList/use-social', () => ({
  __esModule: true,
  default: () => ({
    invokeSocialSignIn: mockedInvokeSocialSignIn,
    theme: 'light',
    socialConnectors: [],
  }),
}));

jest.mock('@/hooks/use-single-sign-on', () => ({
  __esModule: true,
  default: () => mockedInvokeSso,
}));

jest.mock('@/hooks/use-native-message-listener', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const ssoConnector: SsoConnectorMetadata = {
  id: 'sso-1',
  connectorName: 'Okta',
  logo: 'https://logo/okta.png',
  darkLogo: undefined,
};

// The GitHub connector from the mocked sign-in experience settings.
const githubConnector = socialConnectors[0]!;

const settings: SignInExperienceResponse = {
  ...mockSignInExperienceSettings,
  ssoConnectors: [ssoConnector],
};

const socialProof: SubjectProofConnector = { type: 'social', connectorId: githubConnector.id };
const ssoProof: SubjectProofConnector = { type: 'sso', connectorId: ssoConnector.id };

const renderList = (connectors: readonly SubjectProofConnector[]) =>
  renderWithPageContext(
    <SettingsProvider settings={settings}>
      <StepUpSubjectProofList connectors={connectors} />
    </SettingsProvider>
  );

/** The connector logo the button renders: `alt` is the target (social) or connector name (sso). */
const getButtonLogo = (button: HTMLElement) => {
  const image = within(button).getByRole('img');

  return { alt: image.getAttribute('alt'), src: image.getAttribute('src') };
};

describe('StepUpSubjectProofList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders one button per resolvable connector in the given order (social then sso)', () => {
    renderList([socialProof, ssoProof]);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);

    const [socialButton, ssoButton] = buttons;

    expect(socialButton?.textContent).toBe('action.sign_in_with');
    expect(getButtonLogo(socialButton!)).toEqual({
      alt: githubConnector.target,
      src: githubConnector.logo,
    });

    expect(ssoButton?.textContent).toBe('action.sign_in_with');
    expect(getButtonLogo(ssoButton!)).toEqual({
      alt: ssoConnector.connectorName,
      src: ssoConnector.logo,
    });
  });

  it('keeps the server order when sso comes before social', () => {
    renderList([ssoProof, socialProof]);

    const buttons = screen.getAllByRole('button');
    expect(buttons.map((button) => getButtonLogo(button).alt)).toEqual([
      ssoConnector.connectorName,
      githubConnector.target,
    ]);
  });

  it('renders every social connector the sign-in experience knows', () => {
    const proofs = socialConnectors.map<SubjectProofConnector>(({ id }) => ({
      type: 'social',
      connectorId: id,
    }));

    renderList(proofs);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(socialConnectors.length);
    expect(buttons.map((button) => getButtonLogo(button).alt)).toEqual(
      socialConnectors.map(({ target }) => target)
    );
  });

  it.each<{ readonly unknown: SubjectProofConnector; readonly expectedAlt: string }>([
    {
      unknown: { type: 'social', connectorId: 'unknown-social-connector' },
      expectedAlt: ssoConnector.connectorName,
    },
    {
      unknown: { type: 'sso', connectorId: 'unknown-sso-connector' },
      expectedAlt: githubConnector.target,
    },
  ])('skips an unknown $unknown.type connector id', ({ unknown, expectedAlt }) => {
    const known = unknown.type === 'social' ? ssoProof : socialProof;

    renderList([unknown, known]);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(getButtonLogo(buttons[0]!).alt).toBe(expectedAlt);
  });

  it('renders no button when none of the connector ids is known', () => {
    const { container } = renderList([
      { type: 'social', connectorId: 'unknown-social-connector' },
      { type: 'sso', connectorId: 'unknown-sso-connector' },
    ]);

    expect(screen.queryByRole('button')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });

  it('invokes social sign-in with the full connector object from the settings', async () => {
    renderList([socialProof, ssoProof]);

    const [socialButton] = screen.getAllByRole('button');

    await act(async () => {
      fireEvent.click(socialButton!);
    });

    expect(mockedInvokeSocialSignIn).toHaveBeenCalledTimes(1);
    expect(mockedInvokeSocialSignIn).toHaveBeenCalledWith(githubConnector);
    // The very object from the settings is forwarded, not a re-shaped copy.
    expect(mockedInvokeSocialSignIn.mock.calls[0]?.[0]).toBe(githubConnector);
    expect(mockedInvokeSso).not.toHaveBeenCalled();
  });

  it('invokes single sign-on with the sso connector id', async () => {
    renderList([socialProof, ssoProof]);

    const [, ssoButton] = screen.getAllByRole('button');

    await act(async () => {
      fireEvent.click(ssoButton!);
    });

    expect(mockedInvokeSso).toHaveBeenCalledTimes(1);
    expect(mockedInvokeSso).toHaveBeenCalledWith(ssoConnector.id);
    expect(mockedInvokeSocialSignIn).not.toHaveBeenCalled();
  });

  it('renders an empty list for an empty connectors prop', () => {
    const { container } = renderList([]);

    expect(screen.queryByRole('button')).toBeNull();
    expect(container.querySelector('.connectorList')).not.toBeNull();
    expect(container.querySelector('.connectorList')?.childElementCount).toBe(0);
  });
});
