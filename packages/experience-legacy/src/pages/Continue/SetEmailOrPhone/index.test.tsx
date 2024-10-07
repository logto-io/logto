import { MissingProfile, SignInIdentifier } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { sendVerificationCodeApi } from '@/apis/utils';
import { UserFlow, type VerificationCodeIdentifier } from '@/types';
import { getDefaultCountryCallingCode } from '@/utils/country-code';

import SetEmailOrPhone, { type VerificationCodeProfileType, pageContent } from '.';

const mockedNavigate = jest.fn();

// PhoneNum CountryCode detection
jest.mock('i18next', () => ({
  language: 'en',
  t: (key: string) => key,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useLocation: jest.fn(() => ({
    state: {
      flow: UserFlow.SignIn,
      registeredSocialIdentity: {
        email: 'foo@logto.io',
      },
    },
  })),
}));

jest.mock('@/apis/utils', () => ({
  sendVerificationCodeApi: jest.fn(),
}));

describe('continue with email or phone', () => {
  const renderPage = (missingProfile: VerificationCodeProfileType) =>
    renderWithPageContext(
      <SettingsProvider>
        <SetEmailOrPhone missingProfile={missingProfile} />
      </SettingsProvider>
    );

  const cases: Array<[VerificationCodeProfileType, { title: string; description: string }]> = [
    [MissingProfile.email, pageContent.email],
    [MissingProfile.phone, pageContent.phone],
    [MissingProfile.emailOrPhone, pageContent.emailOrPhone],
  ];

  test.each(cases)('render set %p', (type, content) => {
    const { queryByText, container } = renderPage(type);

    expect(queryByText(content.title)).not.toBeNull();
    expect(queryByText(content.description)).not.toBeNull();
    expect(container.querySelector('input[name="identifier"]')).not.toBeNull();
    expect(queryByText('action.continue')).not.toBeNull();

    if (type === MissingProfile.email || type === MissingProfile.emailOrPhone) {
      expect(queryByText('description.social_identity_exist')).not.toBeNull();
    }
  });

  const email = 'foo@logto.io';
  const phone = '8573333333';
  const countryCode = getDefaultCountryCallingCode();

  test.each([
    [MissingProfile.email, SignInIdentifier.Email, email],
    [MissingProfile.phone, SignInIdentifier.Phone, phone],
    [MissingProfile.emailOrPhone, SignInIdentifier.Email, email],
    [MissingProfile.emailOrPhone, SignInIdentifier.Phone, phone],
  ] satisfies Array<[VerificationCodeProfileType, VerificationCodeIdentifier, string]>)(
    'should send verification code properly',
    async (type, identifier, input) => {
      const { getByLabelText, getByText, container } = renderPage(type);

      const inputField = container.querySelector('input[name="identifier"]');
      const submitButton = getByText('action.continue');

      assert(inputField, new Error('input field not found'));
      expect(submitButton).not.toBeNull();

      act(() => {
        fireEvent.change(inputField, { target: { value: input } });
      });

      act(() => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(sendVerificationCodeApi).toBeCalledWith(UserFlow.Continue, {
          [identifier]: identifier === SignInIdentifier.Phone ? `${countryCode}${input}` : input,
        });
      });
    }
  );
});
