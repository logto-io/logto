import { type SignIn, SignInIdentifier, VerificationType } from '@logto/schemas';
import { act, fireEvent } from '@testing-library/react';
import { HTTPError } from 'ky';

import ConfirmModalProvider from '@/Providers/ConfirmModalProvider';
import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import {
  emailSignInMethod,
  mockSignInExperienceSettings,
  phoneSignInMethod,
} from '@/__mocks__/logto';
import { signInAndLinkWithSocial, updateProfileWithVerificationCode } from '@/apis/experience';
import { UserFlow } from '@/types';

import VerificationCode from '.';

jest.useFakeTimers();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('@/apis/experience', () => ({
  ...jest.requireActual('@/apis/experience'),
  sendVerificationCode: jest.fn(),
  updateProfileWithVerificationCode: jest.fn(),
  signInAndLinkWithSocial: jest.fn(),
}));

const verificationIdsStorageKey = `logto:${window.location.origin}:verification-ids`;

const phoneIdentifier = { type: SignInIdentifier.Phone, value: '18573333333' } as const;

const phoneAlreadyInUseError = () =>
  new HTTPError(
    {
      status: 422,
      statusText: 'Unprocessable Entity',
      json: async () => ({ code: 'user.phone_already_in_use', message: 'phone already in use' }),
    } as unknown as Response,
    {} as Request,
    {} as never
  );

const renderLinkSocialContinueFlow = (signInMethods: SignIn['methods']) =>
  renderWithPageContext(
    <SettingsProvider
      settings={{ ...mockSignInExperienceSettings, signIn: { methods: signInMethods } }}
    >
      <UserInteractionContextProvider>
        <ConfirmModalProvider>
          <VerificationCode
            flow={UserFlow.Continue}
            identifier={phoneIdentifier}
            verificationId="phone-verification-id"
          />
        </ConfirmModalProvider>
      </UserInteractionContextProvider>
    </SettingsProvider>,
    { initialEntries: ['/continue/verification-code?link_social=connector-id'] }
  );

const fillVerificationCode = (container: HTMLElement) => {
  for (const input of container.querySelectorAll('input')) {
    act(() => {
      fireEvent.input(input, { target: { value: '1' } });
    });
  }
};

describe('<VerificationCode /> continue flow linking a social account to an identifier in use', () => {
  beforeEach(() => {
    sessionStorage.setItem(
      verificationIdsStorageKey,
      JSON.stringify({ [VerificationType.Social]: 'social-verification-id' })
    );
    (updateProfileWithVerificationCode as jest.Mock).mockRejectedValueOnce(
      phoneAlreadyInUseError()
    );
  });

  afterEach(() => {
    sessionStorage.removeItem(verificationIdsStorageKey);
    jest.clearAllMocks();
  });

  it('offers to link the social account when the identifier can sign in with a verification code', async () => {
    const { container, findByText } = renderLinkSocialContinueFlow([phoneSignInMethod]);

    fillVerificationCode(container);

    expect(await findByText('description.link_account_id_exists')).toBeTruthy();
  });

  it('asks for another identifier when the identifier cannot sign in with a verification code', async () => {
    const { container, findByText, queryByText } = renderLinkSocialContinueFlow([
      emailSignInMethod,
    ]);

    fillVerificationCode(container);

    expect(await findByText('description.create_account_id_exists_alert')).toBeTruthy();
    expect(queryByText('action.bind_and_continue')).toBeNull();
    expect(signInAndLinkWithSocial).not.toBeCalled();
  });
});
