import {
  AuthenticationContextMode,
  type InteractionAuthenticationContext,
  InteractionEvent,
  LogtoAcr,
  MissingProfile,
  VerificationType,
} from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { useMemo, useState } from 'react';

import StepUpContext, {
  type StepUpContextType,
} from '@/Providers/StepUpContextProvider/StepUpContext';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import type useSelectStepUpMethod from '@/containers/StepUpMethodList/use-select-step-up-method';
import { type ResolvedSubjectProofConnector } from '@/hooks/use-connectors';
import { type StepUpMethod } from '@/utils/step-up';

import StepUp from '.';

type SelectStepUpMethodOptions = Parameters<typeof useSelectStepUpMethod>[0];

const mockedNavigate = jest.fn();
const mockRedirectTo = jest.fn();
const mockedHandleError = jest.fn();
const mockedSubmitInteraction = jest.fn();
const mockedSelectMethod = jest.fn<Promise<void>, [StepUpMethod]>();
const mockedUseSelectStepUpMethod = jest.fn<typeof mockedSelectMethod, [SelectStepUpMethodOptions]>(
  () => mockedSelectMethod
);

const mockSocial = { id: 'c1', target: 'c1' };
const mockSso = { id: 'sso-1', connectorName: 'sso-1' };

const mockFindConnectorById = jest.fn((id?: string): ResolvedSubjectProofConnector | undefined =>
  id === 'c1'
    ? { type: 'social', connector: mockSocial as never }
    : id === 'sso-1'
      ? { type: 'sso', connector: mockSso as never }
      : undefined
);

jest.mock('@/hooks/use-connectors', () => ({
  __esModule: true,
  default: () => ({ findConnectorById: mockFindConnectorById }),
}));
jest.mock('@/hooks/use-error-handler', () => ({
  __esModule: true,
  default: () => mockedHandleError,
}));
jest.mock('@/apis/experience', () => ({ submitInteraction: () => mockedSubmitInteraction() }));
jest.mock('@/hooks/use-global-redirect-to', () => ({
  __esModule: true,
  default: () => mockRedirectTo,
}));
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
  default: ({ connectors }: { readonly connectors: readonly ResolvedSubjectProofConnector[] }) => (
    <ul data-testid="step-up-subject-proof-list">
      {connectors.map(({ type, connector }) => (
        <li key={connector.id}>{`${type}:${connector.id}`}</li>
      ))}
    </ul>
  ),
}));

const mockLoad = jest.fn(async () => true);
const refetch = jest.fn(async () => {
  /* No-op */
});

const defaultContext: InteractionAuthenticationContext = {
  requestedAcrValues: [LogtoAcr.FirstFactor],
  selectedAcr: LogtoAcr.FirstFactor,
  mode: AuthenticationContextMode.StepUp,
  availableMethods: [],
  establishableMethods: [],
  enrollableFactors: [],
  subjectProofConnectors: [],
  maskedIdentifiers: {},
};

const createAuthenticationContext = (
  overrides?: Partial<InteractionAuthenticationContext>
): InteractionAuthenticationContext => ({ ...defaultContext, ...overrides });

const renderStepUp = async (value: Partial<StepUpContextType>) => {
  const result = renderWithPageContext(
    <StepUpContext.Provider
      value={{ isLoading: false, isLoaded: true, load: mockLoad, refetch, ...value }}
    >
      <StepUp />
    </StepUpContext.Provider>
  );
  await act(async () => {
    /* Flush arrival load microtask */
  });
  return result;
};

const TestRig = ({
  isInitiallyLoading = false,
  authenticationContext,
}: {
  readonly isInitiallyLoading?: boolean;
  readonly authenticationContext: InteractionAuthenticationContext;
}) => {
  const [isLoading, setIsLoading] = useState(isInitiallyLoading);
  const [context, setContext] = useState(authenticationContext);
  const value = useMemo(
    () => ({
      authenticationContext: context,
      isLoading,
      isLoaded: !isLoading,
      load: mockLoad,
      refetch,
    }),
    [context, isLoading]
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

const setNativeSdk = (platform: 'android' | 'ios') => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- tests stage the native SDK global
  window.logtoNativeSdk = {
    platform,
    callbackLink: 'logto://callback',
    getPostMessage: () => jest.fn(),
    supportedConnector: { universal: false, nativeTargets: [] },
  };
};

const getListedItems = (testId: string) =>
  within(screen.getByTestId(testId))
    .getAllByRole('listitem')
    .map(({ textContent }) => textContent);

const neverSettles = async () =>
  new Promise<void>(() => {
    /* Pending */
  });
const settlesWithoutNavigating = async () => {
  /* No-op */
};

describe('StepUp', () => {
  beforeEach(() => {
    mockedSelectMethod.mockImplementation(settlesWithoutNavigating);
    mockedSubmitInteraction.mockRejectedValue(new Error('acr not satisfied'));
  });

  afterEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutation -- tests reset the native SDK global
    window.logtoNativeSdk = undefined;
  });

  it('renders nothing and does not dispatch while the context is loading', async () => {
    const { container } = await renderStepUp({
      authenticationContext: createAuthenticationContext({
        availableMethods: [VerificationType.Password],
      }),
      isLoading: true,
    });
    expect(container.innerHTML).toBe('');
    expect(mockedSelectMethod).not.toHaveBeenCalled();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it('dispatches only once the load settles, so a stale context never decides', async () => {
    mockedSelectMethod.mockImplementation(neverSettles);
    renderWithPageContext(
      <TestRig
        isInitiallyLoading
        authenticationContext={createAuthenticationContext({
          availableMethods: [VerificationType.Password],
        })}
      />
    );
    expect(mockedSelectMethod).not.toHaveBeenCalled();
    await act(async () => {
      fireEvent.click(screen.getByText('settle'));
    });
    await waitFor(() => {
      expect(mockedSelectMethod).toHaveBeenCalledTimes(1);
    });
    expect(mockedSelectMethod).toHaveBeenCalledWith(VerificationType.Password);
  });
  it.each([
    {
      name: 'auto-forwards to the only method with a replacing navigation and renders nothing',
      availableMethods: [VerificationType.Password],
    },
    {
      name: 'ignores verification types the step-up screens cannot render',
      availableMethods: [VerificationType.Social, VerificationType.Password],
    },
  ])('$name', async ({ availableMethods }) => {
    mockedSelectMethod.mockImplementation(neverSettles);
    const authenticationContext = createAuthenticationContext({ availableMethods });
    const { container } = await renderStepUp({ authenticationContext });

    expect(mockedSelectMethod).toHaveBeenCalledWith(VerificationType.Password);
    expect(mockedUseSelectStepUpMethod).toHaveBeenLastCalledWith({
      methods: [VerificationType.Password],
      authenticationContext,
      replace: true,
    });
    expect(mockedNavigate).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe('');
    expect(screen.queryByText('step_up.verify_your_identity')).toBeNull();
  });

  it('falls back to the chooser with the single method when the forward settles without navigating', async () => {
    mockedSelectMethod.mockImplementation(settlesWithoutNavigating);
    renderWithPageContext(
      <TestRig
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
    expect(mockedSelectMethod).toHaveBeenCalledWith(VerificationType.EmailVerificationCode);

    fireEvent.click(screen.getByText('refetch'));
    expect(getListedItems('step-up-method-list')).toEqual([VerificationType.EmailVerificationCode]);
    expect(mockedSelectMethod).toHaveBeenCalledTimes(1);
  });

  it('renders the chooser without auto-forwarding when several methods are available', async () => {
    await renderStepUp({
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
    expect(mockedSelectMethod).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: 'renders subject-proof connectors when no method is available',
      context: { subjectProofConnectors: [{ type: 'social' as const, connectorId: 'c1' }] },
      expected: ['social:c1'],
    },
    {
      name: 'prefers subject-proof connectors over an establishable method',
      context: {
        establishableMethods: [MissingProfile.password],
        subjectProofConnectors: [
          { type: 'social' as const, connectorId: 'c1' },
          { type: 'sso' as const, connectorId: 'sso-1' },
        ],
      },
      expected: ['social:c1', 'sso:sso-1'],
    },
  ])('$name', async ({ context, expected }) => {
    await renderStepUp({ authenticationContext: createAuthenticationContext(context) });
    expect(screen.getByText('step_up.verify_your_identity')).not.toBeNull();
    expect(screen.getByText('step_up.subject_proof_description')).not.toBeNull();
    expect(getListedItems('step-up-subject-proof-list')).toEqual(expected);
    expect(mockedSelectMethod).not.toHaveBeenCalled();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: 'forwards to the continue page of the first establishable method when nothing can be verified',
      context: { establishableMethods: [MissingProfile.password, MissingProfile.email] },
    },
    {
      name: 'skips disabled subject-proof connectors and falls back to an establishable method',
      context: {
        establishableMethods: [MissingProfile.password],
        subjectProofConnectors: [{ type: 'social' as const, connectorId: 'disabled-connector' }],
      },
    },
  ])('$name', async ({ context }) => {
    const { container } = await renderStepUp({
      authenticationContext: createAuthenticationContext(context),
    });
    expect(mockedNavigate).toHaveBeenCalledWith('/continue/password', {
      replace: true,
      state: { interactionEvent: InteractionEvent.SignIn },
    });
    expect(container.innerHTML).toBe('');
    expect(mockedSelectMethod).not.toHaveBeenCalled();
    expect(screen.queryByTestId('step-up-subject-proof-list')).toBeNull();
  });

  it('attempts submission when nothing is available, falling back to no-method page on failure', async () => {
    mockedSubmitInteraction.mockResolvedValueOnce({ redirectTo: 'https://callback.example.com' });
    await renderStepUp({ authenticationContext: createAuthenticationContext() });
    await waitFor(() => {
      expect(mockRedirectTo).toHaveBeenCalledWith('https://callback.example.com');
    });

    mockedSubmitInteraction.mockRejectedValueOnce(new Error('acr not satisfied'));
    await renderStepUp({ authenticationContext: createAuthenticationContext() });
    expect(await screen.findByText('step_up.no_method_available')).not.toBeNull();
  });

  it.each([
    {
      name: 'drops WebAuthn on a native webview and auto-forwards to the remaining method',
      platform: 'android' as const,
      availableMethods: [VerificationType.WebAuthn, VerificationType.TOTP],
      expectedMethod: VerificationType.TOTP,
    },
    {
      name: 'keeps WebAuthn on a native webview when it is the only method',
      platform: 'ios' as const,
      availableMethods: [VerificationType.WebAuthn],
      expectedMethod: VerificationType.WebAuthn,
    },
  ])('$name', async ({ platform, availableMethods, expectedMethod }) => {
    setNativeSdk(platform);
    mockedSelectMethod.mockImplementation(neverSettles);
    const authenticationContext = createAuthenticationContext({ availableMethods });
    await renderStepUp({ authenticationContext });
    expect(mockedUseSelectStepUpMethod).toHaveBeenLastCalledWith({
      methods: [expectedMethod],
      authenticationContext,
      replace: true,
    });
    expect(mockedSelectMethod).toHaveBeenCalledWith(expectedMethod);
  });

  it('does not dispatch with stale context while arrival load is in flight', async () => {
    const deferred = { resolve: noop };
    mockLoad.mockImplementationOnce(
      async () =>
        new Promise<boolean>((resolve) => {
          // eslint-disable-next-line @silverhand/fp/no-mutation -- tests control the deferred arrival-load settlement
          deferred.resolve = () => {
            resolve(true);
          };
        })
    );
    const authenticationContext = createAuthenticationContext({
      availableMethods: [VerificationType.Password],
    });
    renderWithPageContext(
      <StepUpContext.Provider
        value={{ authenticationContext, isLoading: false, isLoaded: true, load: mockLoad, refetch }}
      >
        <StepUp />
      </StepUpContext.Provider>
    );
    expect(mockedSelectMethod).not.toHaveBeenCalled();
    await act(async () => {
      deferred.resolve();
    });
    await waitFor(() => {
      expect(mockedSelectMethod).toHaveBeenCalledTimes(1);
    });
    expect(mockedSelectMethod).toHaveBeenCalledWith(VerificationType.Password);
  });

  it('hands non-ACR submission errors to the error handler', async () => {
    const error = new Error('session gone');
    mockedSubmitInteraction.mockRejectedValue(error);
    await renderStepUp({ authenticationContext: createAuthenticationContext() });
    await waitFor(() => {
      expect(mockedHandleError).toHaveBeenCalledWith(error, expect.anything());
    });
  });
});
