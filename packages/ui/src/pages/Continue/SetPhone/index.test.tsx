import { SignInIdentifier } from '@logto/schemas';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';

import SetPhone from '.';

const mockedNavigate = jest.fn();
// PhoneNum CountryCode detection
jest.mock('i18next', () => ({
  language: 'en',
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useLocation: () => ({ pathname: '' }),
}));

describe('SetPhone', () => {
  it('render set phone', () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          signUp: { ...mockSignInExperienceSettings.signUp, methods: [SignInIdentifier.Sms] },
        }}
      >
        <SetPhone />
      </SettingsProvider>
    );

    expect(queryByText('description.link_phone')).not.toBeNull();
    expect(queryByText('description.link_phone_description')).not.toBeNull();
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
    expect(queryByText('action.continue')).not.toBeNull();
  });

  it('render set phone with email alterations', () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          signUp: {
            ...mockSignInExperienceSettings.signUp,
            methods: [SignInIdentifier.Email, SignInIdentifier.Sms],
          },
        }}
      >
        <SetPhone />
      </SettingsProvider>
    );

    expect(queryByText('description.link_email_or_phone')).not.toBeNull();
    expect(queryByText('description.link_email_or_phone_description')).not.toBeNull();
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
    expect(queryByText('action.continue')).not.toBeNull();
    expect(queryByText('action.switch_to')).not.toBeNull();
  });
});
