import {
  AuthenticationContextMode,
  type InteractionAuthenticationContext,
  LogtoAcr,
  VerificationType,
} from '@logto/schemas';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { HTTPError } from 'ky';
import { useEffect } from 'react';
import { Link, Route, Routes } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { getStepUpContext, initStepUp } from '@/apis/experience';
import { stepUpRoutes } from '@/constants/step-up';
import useStepUpContext from '@/hooks/use-step-up-context';

import StepUpGuard from '.';

const mockRedirectTo = jest.fn();
const mockHandleError = jest.fn();
/** Every text the landing rendered, in order, so a stale render can be caught. */
const mockLandingRender = jest.fn<void, [string]>();
/** Called once per mount of the child page. */
const mockChildMount = jest.fn();

jest.mock('@/apis/experience', () => ({
  getStepUpContext: jest.fn(),
  initStepUp: jest.fn(),
}));

jest.mock('@/hooks/use-global-redirect-to', () => ({
  __esModule: true,
  default: () => mockRedirectTo,
}));

jest.mock('@/hooks/use-error-handler', () => ({
  __esModule: true,
  default: () => mockHandleError,
}));

const mockedGetStepUpContext = getStepUpContext as jest.MockedFunction<typeof getStepUpContext>;
const mockedInitStepUp = initStepUp as jest.MockedFunction<typeof initStepUp>;

const stepUpContext: InteractionAuthenticationContext = {
  requestedAcrValues: [LogtoAcr.Mfa],
  selectedAcr: LogtoAcr.Mfa,
  mode: AuthenticationContextMode.StepUp,
  availableMethods: [VerificationType.Password, VerificationType.EmailVerificationCode],
  establishableMethods: [],
  enrollableFactors: [],
  subjectProofConnectors: [],
  maskedIdentifiers: { email: 'f***@logto.io' },
};

/** The context after the interaction recorded a proof: one method is left. */
const refreshedStepUpContext: InteractionAuthenticationContext = {
  ...stepUpContext,
  availableMethods: [VerificationType.Password],
};

/**
 * Build a ky `HTTPError` carrying a Logto error code. `Response` is not a global in the jsdom
 * test environment, so a minimal fake is enough: the provider reads
 * `error.response.clone().json()` and the constructor only reads `status` / `statusText`.
 */
const createRequestError = (code: string, status = 404) => {
  const body = { code, message: code };
  const response = {
    status,
    statusText: status === 404 ? 'Not Found' : 'Internal Server Error',
    json: async () => body,
    clone: () => ({ json: async () => body }),
  } as unknown as Response;

  return new HTTPError(response, {} as Request, {} as never);
};

const renderMethods = (context?: InteractionAuthenticationContext) =>
  context?.availableMethods.join(',') ?? 'none';

/** Mirrors the real landing page: it waits for `isLoading` before reading the context. */
const Landing = () => {
  const { authenticationContext, isLoading } = useStepUpContext();
  const text = isLoading ? 'landing:loading' : `landing:${renderMethods(authenticationContext)}`;
  mockLandingRender(text);

  return <div>{text}</div>;
};

const Child = () => {
  const { authenticationContext, refetch } = useStepUpContext();

  useEffect(() => {
    mockChildMount();
  }, []);

  return (
    <div>
      <div>{`child:${renderMethods(authenticationContext)}`}</div>
      <Link to={stepUpRoutes.landing}>back to landing</Link>
      <button
        type="button"
        onClick={() => {
          void refetch();
        }}
      >
        refetch
      </button>
    </div>
  );
};

const renderGuard = (initialEntry: string) =>
  renderWithPageContext(
    <Routes>
      <Route path={stepUpRoutes.landing} element={<StepUpGuard />}>
        <Route index element={<Landing />} />
        <Route path="password" element={<Child />} />
      </Route>
    </Routes>,
    { initialEntries: [initialEntry] }
  );

describe('StepUpGuard', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('landing route', () => {
    it('creates the interaction only after a 404 interaction_not_found, then re-reads the context', async () => {
      mockedGetStepUpContext
        .mockRejectedValueOnce(createRequestError('session.interaction_not_found'))
        .mockResolvedValueOnce(stepUpContext);
      mockedInitStepUp.mockResolvedValue({});

      renderGuard(stepUpRoutes.landing);

      expect(await screen.findByText('landing:Password,EmailVerificationCode')).not.toBeNull();

      expect(mockedGetStepUpContext).toHaveBeenCalledTimes(2);
      expect(mockedInitStepUp).toHaveBeenCalledTimes(1);
      expect(mockedInitStepUp).toHaveBeenCalledWith();

      // Call order: GET, PUT, GET.
      const [firstGet, secondGet] = mockedGetStepUpContext.mock.invocationCallOrder;
      const [put] = mockedInitStepUp.mock.invocationCallOrder;
      expect(firstGet).toBeLessThan(put ?? 0);
      expect(put).toBeLessThan(secondGet ?? 0);

      expect(mockHandleError).not.toHaveBeenCalled();
      expect(mockRedirectTo).not.toHaveBeenCalled();
    });

    it('keeps the existing interaction on refresh and never calls initStepUp', async () => {
      mockedGetStepUpContext.mockResolvedValue(stepUpContext);

      renderGuard(stepUpRoutes.landing);

      expect(await screen.findByText('landing:Password,EmailVerificationCode')).not.toBeNull();

      expect(mockedGetStepUpContext).toHaveBeenCalledTimes(1);
      expect(mockedInitStepUp).not.toHaveBeenCalled();
      expect(mockHandleError).not.toHaveBeenCalled();
    });

    it('renders the invalid-session page when the interaction carries no authentication context', async () => {
      mockedGetStepUpContext.mockResolvedValue(undefined);

      renderGuard(stepUpRoutes.landing);

      expect(await screen.findByText('error.invalid_session')).not.toBeNull();

      expect(screen.queryByText(/^landing:/)).toBeNull();
      expect(mockedInitStepUp).not.toHaveBeenCalled();
      expect(mockHandleError).not.toHaveBeenCalled();
    });

    it('follows the redirectTo returned by initStepUp without reading the context again', async () => {
      const redirectUrl = 'https://app.example/callback?error=unmet_authentication_requirements';
      mockedGetStepUpContext.mockRejectedValueOnce(
        createRequestError('session.interaction_not_found')
      );
      mockedInitStepUp.mockResolvedValue({ redirectTo: redirectUrl });

      renderGuard(stepUpRoutes.landing);

      await waitFor(() => {
        expect(mockRedirectTo).toHaveBeenCalledWith(redirectUrl);
      });

      expect(mockRedirectTo).toHaveBeenCalledTimes(1);
      expect(mockedGetStepUpContext).toHaveBeenCalledTimes(1);
      expect(mockedInitStepUp).toHaveBeenCalledTimes(1);
      // The redirect unloads the page: neither the landing nor the error page is shown.
      expect(screen.queryByText(/^landing:/)).toBeNull();
      expect(screen.queryByText('error.invalid_session')).toBeNull();
      expect(mockHandleError).not.toHaveBeenCalled();
    });

    it.each([
      ['a 500 with a Logto error code', createRequestError('guard.invalid_input', 500)],
      ['a plain Error', new Error('network down')],
    ])(
      'surfaces %s through the error handler and renders the invalid-session page',
      async (_, error) => {
        mockedGetStepUpContext.mockRejectedValue(error);

        renderGuard(stepUpRoutes.landing);

        expect(await screen.findByText('error.invalid_session')).not.toBeNull();

        expect(mockHandleError).toHaveBeenCalledTimes(1);
        expect(mockHandleError).toHaveBeenCalledWith(error);
        // Only `session.interaction_not_found` creates the interaction.
        expect(mockedInitStepUp).not.toHaveBeenCalled();
        expect(mockRedirectTo).not.toHaveBeenCalled();
      }
    );

    it('does not create the interaction or toast when the subject is gone', async () => {
      mockedGetStepUpContext.mockRejectedValue(
        createRequestError('session.step_up.subject_not_found')
      );

      renderGuard(stepUpRoutes.landing);

      expect(await screen.findByText('error.invalid_session')).not.toBeNull();

      expect(mockedGetStepUpContext).toHaveBeenCalledTimes(1);
      expect(mockedInitStepUp).not.toHaveBeenCalled();
      expect(mockHandleError).not.toHaveBeenCalled();
    });

    it('surfaces a failed initStepUp through the error handler', async () => {
      const initError = createRequestError('guard.invalid_input', 500);
      mockedGetStepUpContext.mockRejectedValueOnce(
        createRequestError('session.interaction_not_found')
      );
      mockedInitStepUp.mockRejectedValue(initError);

      renderGuard(stepUpRoutes.landing);

      expect(await screen.findByText('error.invalid_session')).not.toBeNull();

      expect(mockedGetStepUpContext).toHaveBeenCalledTimes(1);
      expect(mockedInitStepUp).toHaveBeenCalledTimes(1);
      expect(mockHandleError).toHaveBeenCalledWith(initError);
      expect(mockRedirectTo).not.toHaveBeenCalled();
    });
  });

  describe('child route', () => {
    it('reads the context once and never calls initStepUp', async () => {
      mockedGetStepUpContext.mockResolvedValue(stepUpContext);

      renderGuard(stepUpRoutes.password);

      expect(await screen.findByText('child:Password,EmailVerificationCode')).not.toBeNull();

      expect(mockedGetStepUpContext).toHaveBeenCalledTimes(1);
      expect(mockedInitStepUp).not.toHaveBeenCalled();
      expect(mockHandleError).not.toHaveBeenCalled();
    });

    it('renders the invalid-session page without a toast when the interaction is gone', async () => {
      mockedGetStepUpContext.mockRejectedValue(createRequestError('session.interaction_not_found'));

      renderGuard(stepUpRoutes.password);

      expect(await screen.findByText('error.invalid_session')).not.toBeNull();

      expect(screen.queryByText(/^child:/)).toBeNull();
      expect(mockedGetStepUpContext).toHaveBeenCalledTimes(1);
      // A child route never creates the interaction, even on 404.
      expect(mockedInitStepUp).not.toHaveBeenCalled();
      expect(mockHandleError).not.toHaveBeenCalled();
    });

    it('re-reads the context on refetch while keeping the page mounted', async () => {
      mockedGetStepUpContext
        .mockResolvedValueOnce(stepUpContext)
        .mockResolvedValueOnce(refreshedStepUpContext);

      renderGuard(stepUpRoutes.password);

      expect(await screen.findByText('child:Password,EmailVerificationCode')).not.toBeNull();

      fireEvent.click(screen.getByText('refetch'));

      expect(await screen.findByText('child:Password')).not.toBeNull();

      expect(mockedGetStepUpContext).toHaveBeenCalledTimes(2);
      expect(mockedInitStepUp).not.toHaveBeenCalled();
      expect(screen.queryByText('error.invalid_session')).toBeNull();
      // The guard kept the page mounted through the refetch instead of remounting it.
      expect(mockChildMount).toHaveBeenCalledTimes(1);
    });

    it('loads the context again when navigating back to the landing', async () => {
      mockedGetStepUpContext
        .mockResolvedValueOnce(stepUpContext)
        .mockResolvedValueOnce(refreshedStepUpContext);

      renderGuard(stepUpRoutes.password);

      expect(await screen.findByText('child:Password,EmailVerificationCode')).not.toBeNull();
      expect(mockedGetStepUpContext).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText('back to landing'));

      expect(await screen.findByText('landing:Password')).not.toBeNull();

      // A new arrival at the landing is loading from its very first render, even though the
      // context of the previous visit is still present: it never rendered the stale methods.
      const landingRenders = mockLandingRender.mock.calls.map(([text]) => text);
      expect(landingRenders[0]).toBe('landing:loading');
      expect(landingRenders).not.toContain('landing:Password,EmailVerificationCode');

      expect(mockedGetStepUpContext).toHaveBeenCalledTimes(2);
      expect(mockedInitStepUp).not.toHaveBeenCalled();
      expect(mockHandleError).not.toHaveBeenCalled();
    });
  });
});
