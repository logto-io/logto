import { SignInIdentifier } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { act, fireEvent, waitFor } from '@testing-library/react';

import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { sendVerificationCodeApi } from '@/apis/utils';
import { UserFlow, type VerificationCodeIdentifier } from '@/types';

import ForgotPasswordForm from '.';

const mockedNavigate = jest.fn();

jest.mock('i18next', () => ({
  language: 'en',
  t: (key: string) => key,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('@/apis/utils', () => ({
  sendVerificationCodeApi: jest.fn().mockResolvedValue({ verificationId: '123' }),
}));

describe('ForgotPasswordForm', () => {
  const email = 'foo@logto.io';
  const countryCode = '86';
  const phone = '13911111111';
  const originalLocation = window.location;

  const renderForm = (defaultValue?: string) =>
    renderWithPageContext(
      <UserInteractionContextProvider>
        <ForgotPasswordForm
          enabledTypes={[SignInIdentifier.Email, SignInIdentifier.Phone]}
          defaultValue={defaultValue}
        />
      </UserInteractionContextProvider>
    );

  afterEach(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    Object.defineProperty(window, 'location', {
      value: originalLocation,
    });

    jest.clearAllMocks();
  });

  describe.each([
    { identifier: SignInIdentifier.Email, value: email },
    { identifier: SignInIdentifier.Phone, value: `${countryCode}${phone}` },
  ] satisfies Array<{ identifier: VerificationCodeIdentifier; value: string }>)(
    'identifier: %s, value: %s',
    ({ identifier, value }) => {
      test(`forgot password form render properly with default ${identifier} value ${value}`, async () => {
        const { container, queryByText } = renderForm(value);
        const identifierInput = container.querySelector(`input[name="identifier"]`);

        assert(identifierInput, new Error('identifier input should not be null'));
        expect(queryByText('action.continue')).not.toBeNull();

        if (identifier === SignInIdentifier.Email) {
          expect(identifierInput.getAttribute('value')).toBe(value);
        }

        if (identifier === SignInIdentifier.Phone) {
          expect(identifierInput.getAttribute('value')).toBe(phone);
        }
      });

      test(`send ${identifier} verification code properly`, async () => {
        const { container, getByText } = renderForm(value);
        const identifierInput = container.querySelector(`input[name="identifier"]`);

        assert(identifierInput, new Error('identifier input should not be null'));

        const submitButton = getByText('action.continue');

        act(() => {
          fireEvent.click(submitButton);
        });

        await waitFor(() => {
          expect(sendVerificationCodeApi).toBeCalledWith(
            UserFlow.ForgotPassword,
            {
              type: identifier,
              value,
            },
            undefined
          );
          expect(mockedNavigate).toBeCalledWith(
            {
              pathname: `/${UserFlow.ForgotPassword}/verification-code`,
              search: '',
            },
            { replace: undefined }
          );
        });
      });
    }
  );
});
