import {
  AuthenticationContextMode,
  type InteractionAuthenticationContext,
  LogtoAcr,
  VerificationType,
} from '@logto/schemas';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import StepUpContext, {
  type StepUpContextType,
} from '@/Providers/StepUpContextProvider/StepUpContext';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { verifyStepUpPassword } from '@/apis/experience';
import { type ErrorHandlers } from '@/hooks/use-error-handler';

import StepUpPassword from '.';

const mockedHandleError = jest.fn<Promise<void>, [unknown, ErrorHandlers?]>();
const mockedRedirectTo = jest.fn();
const mockedNavigate = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { dir: () => 'ltr' },
  }),
  Trans: ({ children }: { readonly children: React.ReactNode }) => children,
}));

jest.mock('@/hooks/use-navigate-with-preserved-search-params', () => ({
  __esModule: true,
  default: () => mockedNavigate,
}));

jest.mock('@/hooks/use-error-handler', () => ({
  __esModule: true,
  default: () => mockedHandleError,
}));

jest.mock('@/hooks/use-global-redirect-to', () => ({
  __esModule: true,
  default: () => mockedRedirectTo,
}));

jest.mock('@/apis/experience', () => ({
  ...jest.requireActual('@/apis/experience'),
  verifyStepUpPassword: jest.fn(),
}));

const mockedVerifyStepUpPassword = verifyStepUpPassword as jest.MockedFunction<
  typeof verifyStepUpPassword
>;

const mockLoad = jest.fn(async () => true);
const refetch = jest.fn(async () => {
  // The page never refetches on its own.
});

/** The codes `useStepUpErrorHandler` contributes; every step-up call composes them. */
const stepUpErrorCodes = [
  'session.not_found',
  'session.interaction_not_found',
  'session.step_up.subject_not_found',
  'session.step_up.invalid_interaction_event',
  'session.identity_conflict',
  'session.step_up.forbidden_route',
  'session.step_up.acr_not_satisfied',
];

/** What a sign-in with requested ACR may still need after this factor. */
const submitInteractionErrorCodes = [
  'session.mfa.require_mfa_verification',
  'user.missing_profile',
  'user.missing_mfa',
  'session.step_up.require_verification',
];

const createAuthenticationContext = (
  overrides: Partial<InteractionAuthenticationContext> = {}
): InteractionAuthenticationContext => ({
  requestedAcrValues: [LogtoAcr.FirstFactor],
  selectedAcr: LogtoAcr.FirstFactor,
  mode: AuthenticationContextMode.StepUp,
  availableMethods: [VerificationType.Password],
  establishableMethods: [],
  enrollableFactors: [],
  subjectProofConnectors: [],
  maskedIdentifiers: { email: 'f***@logto.io' },
  ...overrides,
});

const renderPage = (value: Partial<StepUpContextType> = {}) =>
  renderWithPageContext(
    <StepUpContext.Provider
      value={{
        authenticationContext: createAuthenticationContext(),
        isLoading: false,
        isLoaded: true,
        load: mockLoad,
        refetch,
        ...value,
      }}
    >
      <StepUpPassword />
    </StepUpContext.Provider>
  );

const getPasswordInput = (container: HTMLElement) =>
  container.querySelector('input[name="password"]');

const submitPassword = async (container: HTMLElement, password: string) => {
  const input = getPasswordInput(container);
  expect(input).not.toBeNull();
  fireEvent.change(input!, { target: { value: password } });

  const form = container.querySelector('form');
  expect(form).not.toBeNull();

  await act(async () => {
    fireEvent.submit(form!);
  });
};

describe('<StepUpPassword />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the password form when Core still offers the password', () => {
    const { container } = renderPage();

    expect(getPasswordInput(container)).not.toBeNull();
    expect(screen.getByText('action.continue')).not.toBeNull();
    expect(screen.getByText('step_up.enter_password_description')).not.toBeNull();
  });

  it('offers no forgot-password link and no account switching', () => {
    renderPage();

    // The mode rejects the event switch a password reset would start, and the subject is pinned.
    expect(screen.queryByText('action.forgot_password')).toBeNull();
    expect(screen.queryByText('action.sign_in_via_passcode')).toBeNull();
    expect(screen.queryByText('action.switch_to')).toBeNull();
  });

  it.each([
    ['the context is gone', undefined],
    [
      'the password is no longer offered',
      createAuthenticationContext({ availableMethods: [VerificationType.TOTP] }),
    ],
  ])('renders the invalid-session page when %s', (_, authenticationContext) => {
    const { container } = renderPage({ authenticationContext });

    expect(screen.getByText('error.invalid_session')).not.toBeNull();
    expect(getPasswordInput(container)).toBeNull();
  });

  it('submits the password alone and follows the redirect', async () => {
    mockedVerifyStepUpPassword.mockResolvedValueOnce({ redirectTo: 'https://logto.io/callback' });
    const { container } = renderPage();

    await submitPassword(container, 'password');

    await waitFor(() => {
      expect(mockedRedirectTo).toHaveBeenCalledWith('https://logto.io/callback');
    });
    expect(mockedVerifyStepUpPassword).toHaveBeenCalledTimes(1);
    // Nothing that identifies the subject is collected on this page, so nothing can be sent.
    expect(mockedVerifyStepUpPassword).toHaveBeenCalledWith('password');
    expect(mockedHandleError).not.toHaveBeenCalled();
  });

  it('does not submit an empty password', async () => {
    const { container } = renderPage();

    await submitPassword(container, '');

    expect(mockedVerifyStepUpPassword).not.toHaveBeenCalled();
    expect(screen.getByText('error.password_required')).not.toBeNull();
  });

  it('hands a failure to the error handler with the step-up and submission handlers', async () => {
    const error = new Error('Invalid credentials');
    mockedVerifyStepUpPassword.mockRejectedValueOnce(error);
    const { container } = renderPage();

    await submitPassword(container, 'wrong');

    await waitFor(() => {
      expect(mockedHandleError).toHaveBeenCalledTimes(1);
    });

    const [handledError, errorHandlers] = mockedHandleError.mock.calls[0] ?? [];
    expect(handledError).toBe(error);
    expect(Object.keys(errorHandlers ?? {})).toEqual(
      expect.arrayContaining([
        // A wrong password is shown inline rather than toasted.
        'session.invalid_credentials',
        ...stepUpErrorCodes,
        ...submitInteractionErrorCodes,
      ])
    );
    expect(mockedRedirectTo).not.toHaveBeenCalled();
  });

  it('shows an invalid-credentials message on the form', async () => {
    mockedVerifyStepUpPassword.mockRejectedValueOnce(new Error('Invalid credentials'));
    mockedHandleError.mockImplementationOnce(async (_error, errorHandlers) => {
      await errorHandlers?.['session.invalid_credentials']?.({
        code: 'session.invalid_credentials',
        message: 'The password is incorrect.',
        data: {},
      });
    });
    const { container } = renderPage();

    await submitPassword(container, 'wrong');

    await waitFor(() => {
      expect(screen.getByText('The password is incorrect.')).not.toBeNull();
    });
  });
});
