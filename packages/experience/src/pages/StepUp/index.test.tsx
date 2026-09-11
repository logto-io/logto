import {
  AuthenticationContextMode,
  type InteractionAuthenticationContext,
  InteractionEvent,
  LogtoAcr,
  MissingProfile,
  type SubjectProofConnector,
  VerificationType,
} from '@logto/schemas';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { useMemo, useState } from 'react';

import StepUpContext, {
  type StepUpContextType,
} from '@/Providers/StepUpContextProvider/StepUpContext';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import type useSelectStepUpMethod from '@/containers/StepUpMethodList/use-select-step-up-method';
import { type StepUpMethod } from '@/utils/step-up';

import StepUp from '.';

type SelectStepUpMethodOptions = Parameters<typeof useSelectStepUpMethod>[0];

const mockedNavigate = jest.fn();
const mockedSelectMethod = jest.fn<Promise<void>, [StepUpMethod]>();
const mockedUseSelectStepUpMethod = jest.fn<typeof mockedSelectMethod, [SelectStepUpMethodOptions]>(
  () => mockedSelectMethod
);

jest.mock('@/hooks/use-navigate-with-preserved-search-params', () => ({
  __esModule: true,
  default: () => mockedNavigate,
}));

jest.mock('@/containers/StepUpMethodList/use-select-step-up-method', () => ({
  __esModule: true,
  default: (options: SelectStepUpMethodOptions) => mockedUseSelectStepUpMethod(options),
}));

jest.mock('@/containers/StepUpMethodList', () => ({
  __esModule: true,
  default: ({ methods }: { readonly methods: readonly StepUpMethod[] }) => (
    <ul data-testid="step-up-method-list">
      {methods.map((method) => (
        <li key={method}>{method}</li>
      ))}
    </ul>
  ),
}));

jest.mock('@/containers/StepUpSubjectProofList', () => ({
  __esModule: true,
  default: ({ connectors }: { readonly connectors: readonly SubjectProofConnector[] }) => (
    <ul data-testid="step-up-subject-proof-list">
      {connectors.map(({ type, connectorId }) => (
        <li key={connectorId}>{`${type}:${connectorId}`}</li>
      ))}
    </ul>
  ),
}));

const refetch = jest.fn(async () => {
  // The landing page never refetches on its own.
});

const createAuthenticationContext = (
  overrides: Partial<InteractionAuthenticationContext> = {}
): InteractionAuthenticationContext => ({
  requestedAcrValues: [LogtoAcr.FirstFactor],
  selectedAcr: LogtoAcr.FirstFactor,
  mode: AuthenticationContextMode.StepUp,
  availableMethods: [],
  establishableMethods: [],
  enrollableFactors: [],
  subjectProofConnectors: [],
  maskedIdentifiers: {},
  ...overrides,
});

const renderStepUp = (value: Partial<StepUpContextType>) =>
  renderWithPageContext(
    <StepUpContext.Provider value={{ isLoading: false, refetch, ...value }}>
      <StepUp />
    </StepUpContext.Provider>
  );

/** A context that is loading first, then settles on a click, like the real provider. */
const LoadingThenSettled = ({
  authenticationContext,
}: {
  readonly authenticationContext: InteractionAuthenticationContext;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const value = useMemo(
    () => ({ authenticationContext, isLoading, refetch }),
    [authenticationContext, isLoading]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsLoading(false);
        }}
      >
        settle
      </button>
      <StepUpContext.Provider value={value}>
        <StepUp />
      </StepUpContext.Provider>
    </>
  );
};

/** A context whose content stays the same while a refetch hands out a new object, like the real provider. */
const Refetchable = ({
  authenticationContext,
}: {
  readonly authenticationContext: InteractionAuthenticationContext;
}) => {
  const [context, setContext] = useState(authenticationContext);
  const value = useMemo(
    () => ({ authenticationContext: context, isLoading: false, refetch }),
    [context]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setContext({ ...context });
        }}
      >
        refetch
      </button>
      <StepUpContext.Provider value={value}>
        <StepUp />
      </StepUpContext.Provider>
    </>
  );
};

const getListedItems = (testId: string) =>
  within(screen.getByTestId(testId))
    .getAllByRole('listitem')
    .map(({ textContent }) => textContent);

/** The forward never settles: in the real app the navigation unmounts the landing page. */
const neverSettles = async () =>
  new Promise<void>(() => {
    // Intentionally pending.
  });

/** The forward settles without navigating, e.g. a code request that failed and was toasted. */
const settlesWithoutNavigating = async () => {
  // Nothing to do.
};

describe('StepUp', () => {
  beforeEach(() => {
    // Every test starts from a forward that settles, so test order cannot change behavior.
    mockedSelectMethod.mockImplementation(settlesWithoutNavigating);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutation
    window.logtoNativeSdk = undefined;
  });

  it('renders nothing and does not dispatch while the context is loading', () => {
    const { container } = renderStepUp({
      authenticationContext: createAuthenticationContext({
        availableMethods: [VerificationType.Password],
      }),
      isLoading: true,
    });

    expect(container.innerHTML).toBe('');
    expect(mockedSelectMethod).not.toHaveBeenCalled();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it('dispatches only once the load settles, so a stale context never decides', () => {
    mockedSelectMethod.mockImplementation(neverSettles);

    renderWithPageContext(
      <LoadingThenSettled
        authenticationContext={createAuthenticationContext({
          availableMethods: [VerificationType.Password],
        })}
      />
    );

    expect(mockedSelectMethod).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('settle'));

    expect(mockedSelectMethod).toHaveBeenCalledTimes(1);
    expect(mockedSelectMethod).toHaveBeenCalledWith(VerificationType.Password);
  });

  it('auto-forwards to the only method with a replacing navigation and renders nothing', () => {
    mockedSelectMethod.mockImplementation(neverSettles);
    const authenticationContext = createAuthenticationContext({
      availableMethods: [VerificationType.Password],
    });

    const { container } = renderStepUp({ authenticationContext });

    expect(mockedSelectMethod).toHaveBeenCalledTimes(1);
    expect(mockedSelectMethod).toHaveBeenCalledWith(VerificationType.Password);
    expect(mockedUseSelectStepUpMethod).toHaveBeenLastCalledWith({
      methods: [VerificationType.Password],
      authenticationContext,
      replace: true,
    });
    // The page itself never navigates; the selection hook owns the target.
    expect(mockedNavigate).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe('');
    expect(screen.queryByText('step_up.verify_your_identity')).toBeNull();
    expect(screen.queryByTestId('step-up-method-list')).toBeNull();
  });

  it('falls back to the chooser with the single method when the forward settles without navigating', async () => {
    mockedSelectMethod.mockImplementation(settlesWithoutNavigating);

    renderWithPageContext(
      <Refetchable
        authenticationContext={createAuthenticationContext({
          availableMethods: [VerificationType.EmailVerificationCode],
        })}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('step_up.verify_your_identity')).not.toBeNull();
    });

    expect(screen.getByText('step_up.choose_method_description')).not.toBeNull();
    expect(getListedItems('step-up-method-list')).toEqual([VerificationType.EmailVerificationCode]);
    expect(mockedSelectMethod).toHaveBeenCalledTimes(1);
    expect(mockedSelectMethod).toHaveBeenCalledWith(VerificationType.EmailVerificationCode);
    expect(mockedNavigate).not.toHaveBeenCalled();

    // A refetch hands the page a new context object of the same content; the forward was
    // attempted exactly once and the fallback never retries on its own.
    fireEvent.click(screen.getByText('refetch'));

    expect(getListedItems('step-up-method-list')).toEqual([VerificationType.EmailVerificationCode]);
    expect(mockedSelectMethod).toHaveBeenCalledTimes(1);
  });

  it('renders the chooser without auto-forwarding when several methods are available', () => {
    renderStepUp({
      authenticationContext: createAuthenticationContext({
        availableMethods: [VerificationType.Password, VerificationType.TOTP],
      }),
    });

    expect(screen.getByText('step_up.verify_your_identity')).not.toBeNull();
    expect(screen.getByText('step_up.choose_method_description')).not.toBeNull();
    expect(getListedItems('step-up-method-list')).toEqual([
      VerificationType.Password,
      VerificationType.TOTP,
    ]);
    expect(screen.queryByText('step_up.subject_proof_description')).toBeNull();
    expect(screen.queryByTestId('step-up-subject-proof-list')).toBeNull();
    expect(mockedSelectMethod).not.toHaveBeenCalled();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it('ignores verification types the step-up screens cannot render', () => {
    mockedSelectMethod.mockImplementation(neverSettles);
    const authenticationContext = createAuthenticationContext({
      availableMethods: [VerificationType.Social, VerificationType.Password],
    });

    renderStepUp({ authenticationContext });

    // Only the password is a step-up method, so it is the "only method" and is forwarded to.
    expect(mockedUseSelectStepUpMethod).toHaveBeenLastCalledWith({
      methods: [VerificationType.Password],
      authenticationContext,
      replace: true,
    });
    expect(mockedSelectMethod).toHaveBeenCalledTimes(1);
    expect(mockedSelectMethod).toHaveBeenCalledWith(VerificationType.Password);
  });

  it('renders the subject-proof connectors when no method is available', () => {
    renderStepUp({
      authenticationContext: createAuthenticationContext({
        subjectProofConnectors: [{ type: 'social', connectorId: 'c1' }],
      }),
    });

    expect(screen.getByText('step_up.verify_your_identity')).not.toBeNull();
    expect(screen.getByText('step_up.subject_proof_description')).not.toBeNull();
    expect(getListedItems('step-up-subject-proof-list')).toEqual(['social:c1']);
    expect(screen.queryByText('step_up.choose_method_description')).toBeNull();
    expect(screen.queryByTestId('step-up-method-list')).toBeNull();
    expect(mockedSelectMethod).not.toHaveBeenCalled();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it('prefers the subject-proof connectors over an establishable method', () => {
    renderStepUp({
      authenticationContext: createAuthenticationContext({
        establishableMethods: [MissingProfile.password],
        subjectProofConnectors: [
          { type: 'social', connectorId: 'c1' },
          { type: 'sso', connectorId: 'sso-1' },
        ],
      }),
    });

    expect(getListedItems('step-up-subject-proof-list')).toEqual(['social:c1', 'sso:sso-1']);
    expect(mockedNavigate).not.toHaveBeenCalled();
    expect(mockedSelectMethod).not.toHaveBeenCalled();
  });

  it('forwards to the continue page of the first establishable method when nothing can be verified', () => {
    const { container } = renderStepUp({
      authenticationContext: createAuthenticationContext({
        establishableMethods: [MissingProfile.password, MissingProfile.email],
      }),
    });

    expect(mockedNavigate).toHaveBeenCalledTimes(1);
    expect(mockedNavigate).toHaveBeenCalledWith('/continue/password', {
      replace: true,
      state: { interactionEvent: InteractionEvent.SignIn },
    });
    expect(container.innerHTML).toBe('');
    expect(mockedSelectMethod).not.toHaveBeenCalled();
  });

  it('renders the no-method error page when nothing is available', () => {
    renderStepUp({ authenticationContext: createAuthenticationContext() });

    expect(screen.getByText('step_up.no_method_available')).not.toBeNull();
    expect(screen.getByText('step_up.no_method_available_description')).not.toBeNull();
    expect(screen.queryByText('step_up.verify_your_identity')).toBeNull();
    expect(mockedSelectMethod).not.toHaveBeenCalled();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it('drops WebAuthn on a native webview and auto-forwards to the remaining method', () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    window.logtoNativeSdk = {
      platform: 'android',
      callbackLink: 'logto://callback',
      getPostMessage: () => jest.fn(),
      supportedConnector: { universal: false, nativeTargets: [] },
    };
    mockedSelectMethod.mockImplementation(neverSettles);
    const authenticationContext = createAuthenticationContext({
      availableMethods: [VerificationType.WebAuthn, VerificationType.TOTP],
    });

    const { container } = renderStepUp({ authenticationContext });

    expect(mockedUseSelectStepUpMethod).toHaveBeenLastCalledWith({
      methods: [VerificationType.TOTP],
      authenticationContext,
      replace: true,
    });
    expect(mockedSelectMethod).toHaveBeenCalledTimes(1);
    expect(mockedSelectMethod).toHaveBeenCalledWith(VerificationType.TOTP);
    expect(container.innerHTML).toBe('');
  });

  it('keeps WebAuthn on a native webview when it is the only method', () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    window.logtoNativeSdk = {
      platform: 'ios',
      callbackLink: 'logto://callback',
      getPostMessage: () => jest.fn(),
      supportedConnector: { universal: false, nativeTargets: [] },
    };
    mockedSelectMethod.mockImplementation(neverSettles);

    renderStepUp({
      authenticationContext: createAuthenticationContext({
        availableMethods: [VerificationType.WebAuthn],
      }),
    });

    expect(mockedSelectMethod).toHaveBeenCalledTimes(1);
    expect(mockedSelectMethod).toHaveBeenCalledWith(VerificationType.WebAuthn);
  });
});
