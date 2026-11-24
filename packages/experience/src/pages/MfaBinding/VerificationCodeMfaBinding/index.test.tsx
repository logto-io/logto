import { MfaFactor, SignInIdentifier, VerificationType } from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useLocation } from 'react-router-dom';

import UserInteractionContext, {
  type UserInteractionContextType,
} from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { bindMfaByVerificationCode, sendSubjectBindMfaVerificationCode } from '@/apis/experience';
import { type MfaFlowState } from '@/types/guard';

import VerificationCodeMfaBinding from '.';

const mockedRedirectTo = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options && Object.keys(options).length > 0 ? `${key}:${JSON.stringify(options)}` : key,
    i18n: { dir: () => 'ltr' },
  }),
  Trans: ({
    components,
    children,
  }: {
    readonly components?: { a?: React.ReactElement<Record<string, unknown>> };
    readonly children?: React.ReactNode;
  }) =>
    components?.a ? (
      <components.a.type {...components.a.props}>{children}</components.a.type>
    ) : (
      children
    ),
}));

jest.mock('@/apis/experience', () => ({
  ...jest.requireActual('@/apis/experience'),
  bindMfaByVerificationCode: jest.fn(),
  sendSubjectBindMfaVerificationCode: jest.fn(),
}));

jest.mock('@/hooks/use-global-redirect-to', () => ({
  __esModule: true,
  default: () => mockedRedirectTo,
}));

jest.mock('react-timer-hook', () => ({
  useTimer: () => ({
    seconds: 0,
    isRunning: false,
    restart: jest.fn(),
  }),
}));

jest.mock('@/pages/Continue/IdentifierProfileForm', () => ({
  __esModule: true,
  default: () => <div data-testid="identifier-profile-form" />,
}));

jest.mock('@/shared/components/VerificationCode', () => ({
  __esModule: true,
  default: ({ onChange }: { readonly onChange: (code: string[]) => void }) => (
    <button
      type="button"
      onClick={() => {
        onChange(['1', '2', '3', '4', '5', '6']);
      }}
    >
      Fill code
    </button>
  ),
}));

const mockedUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;
const mockedBindMfaByVerificationCode = bindMfaByVerificationCode as jest.MockedFunction<
  typeof bindMfaByVerificationCode
>;
const mockedSendSubjectBindMfaVerificationCode =
  sendSubjectBindMfaVerificationCode as jest.MockedFunction<
    typeof sendSubjectBindMfaVerificationCode
  >;

const createUserInteractionValue = (
  verificationIdsMap: UserInteractionContextType['verificationIdsMap'] = {},
  setVerificationId = jest.fn()
): UserInteractionContextType => ({
  availableSsoConnectorsMap: new Map(),
  setSsoEmail: noop,
  ssoConnectors: [],
  setSsoConnectors: noop,
  setIdentifierInputValue: noop,
  setForgotPasswordIdentifierInputValue: noop,
  setVerificationId,
  verificationIdsMap,
  hasBoundPasskey: false,
  setHasBoundPasskey: noop,
  hasEnteredPassword: () => false,
  setHasEnteredPassword: noop,
  clearInteractionContextSessionStorage: noop,
});

const renderEmailBinding = (
  state: MfaFlowState | undefined,
  verificationIdsMap: UserInteractionContextType['verificationIdsMap'] = {},
  setVerificationId = jest.fn()
) => {
  mockedUseLocation.mockReturnValue({
    pathname: '/mfa-binding/EmailVerificationCode',
    search: '',
    hash: '',
    state,
    key: 'default',
  });

  return renderWithPageContext(
    <UserInteractionContext.Provider
      value={createUserInteractionValue(verificationIdsMap, setVerificationId)}
    >
      <VerificationCodeMfaBinding
        identifierType={SignInIdentifier.Email}
        titleKey="mfa.link_email_verification_code_description"
        descriptionKey="mfa.link_email_2fa_description"
        invalidInputErrorKey="invalid_email"
      />
    </UserInteractionContext.Provider>
  );
};

const buildMaskedEmailState = (availableFactors: MfaFactor[]): MfaFlowState => {
  const maskedIdentifiers: Partial<NonNullable<MfaFlowState['maskedIdentifiers']>> = {
    [MfaFactor.EmailVerificationCode]: 'f***@logto.io',
  };

  return {
    availableFactors,
    maskedIdentifiers: maskedIdentifiers as MfaFlowState['maskedIdentifiers'],
  };
};

describe('<VerificationCodeMfaBinding />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders IdentifierProfileForm when maskedIdentifiers has no entry for the factor', () => {
    renderEmailBinding({
      availableFactors: [MfaFactor.EmailVerificationCode],
    });

    expect(screen.getByTestId('identifier-profile-form')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Fill code' })).toBeNull();
  });

  it('renders MfaCodeVerification when maskedIdentifier and verificationId are present', async () => {
    mockedBindMfaByVerificationCode.mockResolvedValue({
      redirectTo: 'https://example.com/callback',
    });

    renderEmailBinding(buildMaskedEmailState([MfaFactor.EmailVerificationCode, MfaFactor.TOTP]), {
      [VerificationType.EmailVerificationCode]: 'primary-email-vid',
    });

    expect(screen.queryByTestId('identifier-profile-form')).toBeNull();
    expect(screen.getByText('description.verify_email')).not.toBeNull();
    expect(
      screen.getByText(
        `description.enter_passcode:${JSON.stringify({
          address: 'description.email',
          target: 'f***@logto.io',
        })}`
      )
    ).not.toBeNull();
    expect(screen.getByText('mfa.link_another_mfa_factor')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Fill code' }));

    await waitFor(() => {
      expect(mockedBindMfaByVerificationCode).toHaveBeenCalledWith(
        'primary-email-vid',
        '123456',
        SignInIdentifier.Email
      );
      expect(mockedRedirectTo).toHaveBeenCalledWith('https://example.com/callback');
    });
  });

  it('renders invalid session error page when maskedIdentifier is present without verificationId', () => {
    renderEmailBinding(buildMaskedEmailState([MfaFactor.EmailVerificationCode]));

    expect(screen.getByText('error.invalid_session')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Fill code' })).toBeNull();
  });

  it('resends a primary verification code and updates verificationId', async () => {
    const setVerificationId = jest.fn();
    mockedSendSubjectBindMfaVerificationCode.mockResolvedValue({
      verificationId: 'resent-email-vid',
    });

    renderEmailBinding(
      buildMaskedEmailState([MfaFactor.EmailVerificationCode]),
      { [VerificationType.EmailVerificationCode]: 'primary-email-vid' },
      setVerificationId
    );

    fireEvent.click(screen.getByText('description.resend_passcode'));

    await waitFor(() => {
      expect(mockedSendSubjectBindMfaVerificationCode).toHaveBeenCalledWith(SignInIdentifier.Email);
      expect(setVerificationId).toHaveBeenCalledWith(
        VerificationType.EmailVerificationCode,
        'resent-email-vid'
      );
    });
  });
});
