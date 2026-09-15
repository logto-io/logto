import {
  AuthenticationContextMode,
  type InteractionAuthenticationContext,
  LogtoAcr,
  SignInIdentifier,
  VerificationType,
} from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import StepUpContext, {
  type StepUpContextType,
} from '@/Providers/StepUpContextProvider/StepUpContext';
import UserInteractionContext, {
  type UserInteractionContextType,
} from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { type VerificationCodeIdentifier } from '@/types';

import StepUpVerificationCode from '.';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    // Surface the interpolation options so the masked identifier can be asserted on.
    t: (key: string, options?: Record<string, unknown>) =>
      options && Object.keys(options).length > 0 ? `${key}:${JSON.stringify(options)}` : key,
    i18n: { dir: () => 'ltr' },
  }),
  Trans: ({ children }: { readonly children: React.ReactNode }) => children,
}));

jest.mock('@/containers/StepUpCodeVerification', () => ({
  __esModule: true,
  default: ({
    identifierType,
    verificationId,
  }: {
    readonly identifierType: VerificationCodeIdentifier;
    readonly verificationId: string;
  }) => <div data-testid="step-up-code-verification">{`${identifierType}:${verificationId}`}</div>,
}));

const email = 'f***@logto.io';
const phone = '+1******1234';

const mockLoad = jest.fn(async () => true);
const refetch = jest.fn(async () => {
  // The page never refetches on its own.
});

const createAuthenticationContext = (
  overrides: Partial<InteractionAuthenticationContext> = {}
): InteractionAuthenticationContext => ({
  requestedAcrValues: [LogtoAcr.FirstFactor],
  selectedAcr: LogtoAcr.FirstFactor,
  mode: AuthenticationContextMode.StepUp,
  availableMethods: [
    VerificationType.EmailVerificationCode,
    VerificationType.PhoneVerificationCode,
  ],
  establishableMethods: [],
  enrollableFactors: [],
  subjectProofConnectors: [],
  maskedIdentifiers: { email, phone },
  ...overrides,
});

const userInteractionContext = (
  verificationIdsMap: UserInteractionContextType['verificationIdsMap']
): UserInteractionContextType => ({
  availableSsoConnectorsMap: new Map(),
  setSsoEmail: noop,
  ssoConnectors: [],
  setSsoConnectors: noop,
  setIdentifierInputValue: noop,
  setForgotPasswordIdentifierInputValue: noop,
  setVerificationId: noop,
  verificationIdsMap,
  hasBoundPasskey: false,
  setHasBoundPasskey: noop,
  clearInteractionContextSessionStorage: noop,
});

type Options = Partial<StepUpContextType> & {
  type?: string;
  verificationIdsMap?: UserInteractionContextType['verificationIdsMap'];
};

const renderPage = ({
  type = SignInIdentifier.Email,
  verificationIdsMap = { [VerificationType.EmailVerificationCode]: 'email-verification-id' },
  ...stepUp
}: Options = {}) =>
  renderWithPageContext(
    <UserInteractionContext.Provider value={userInteractionContext(verificationIdsMap)}>
      <StepUpContext.Provider
        value={{
          authenticationContext: createAuthenticationContext(),
          isLoading: false,
          isLoaded: true,
          load: mockLoad,
          refetch,
          ...stepUp,
        }}
      >
        <Routes>
          <Route path="/step-up/verification-code/:type" element={<StepUpVerificationCode />} />
        </Routes>
      </StepUpContext.Provider>
    </UserInteractionContext.Provider>,
    { initialEntries: [`/step-up/verification-code/${type}`] }
  );

describe('<StepUpVerificationCode />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    {
      type: SignInIdentifier.Email,
      verificationType: VerificationType.EmailVerificationCode,
      maskedIdentifier: email,
    },
    {
      type: SignInIdentifier.Phone,
      verificationType: VerificationType.PhoneVerificationCode,
      maskedIdentifier: phone,
    },
  ])(
    'renders the $type code input with the verification ID the send stored',
    ({ type, verificationType, maskedIdentifier }) => {
      renderPage({
        type,
        verificationIdsMap: { [verificationType]: 'sent-id' },
      });

      expect(screen.getByTestId('step-up-code-verification').textContent).toBe(`${type}:sent-id`);
      // Only the masked identifier from the server context is displayed.
      expect(
        screen.getByText(
          `step_up.enter_verification_code_description:${JSON.stringify({
            identifier: maskedIdentifier,
          })}`
        )
      ).not.toBeNull();
    }
  );

  it('renders the error page for an identifier type that takes no code', () => {
    renderPage({ type: SignInIdentifier.Username });

    expect(screen.queryByTestId('step-up-code-verification')).toBeNull();
  });

  it.each([
    ['the context is gone', undefined],
    [
      'the code method is no longer offered',
      createAuthenticationContext({ availableMethods: [VerificationType.Password] }),
    ],
  ])('renders the invalid-session page when %s', (_, authenticationContext) => {
    renderPage({ authenticationContext });

    expect(screen.getByText('error.invalid_session')).not.toBeNull();
    expect(screen.queryByTestId('step-up-code-verification')).toBeNull();
  });

  it('renders the invalid-session page when no code was sent for this identifier', () => {
    renderPage({
      type: SignInIdentifier.Phone,
      verificationIdsMap: { [VerificationType.EmailVerificationCode]: 'email-verification-id' },
    });

    expect(screen.getByText('error.invalid_session')).not.toBeNull();
    expect(screen.queryByTestId('step-up-code-verification')).toBeNull();
  });
});
