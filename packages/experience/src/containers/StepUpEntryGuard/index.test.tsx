import {
  AuthenticationContextMode,
  type InteractionAuthenticationContext,
  LogtoAcr,
  VerificationType,
} from '@logto/schemas';
import { act, screen } from '@testing-library/react';
import { HTTPError } from 'ky';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { getStepUpContext } from '@/apis/experience';
import { logtoCookies } from '@/utils/cookies';

import StepUpEntryGuard from '.';

jest.mock('@/apis/experience', () => ({
  getStepUpContext: jest.fn(),
}));
jest.mock('@/utils/cookies', () => ({
  logtoCookies: {},
}));

const mockedGetStepUpContext = getStepUpContext as jest.MockedFunction<typeof getStepUpContext>;

/**
 * Build a ky `HTTPError` carrying a Logto error code. `Response` is not a global in the jsdom
 * test environment, so a minimal fake is enough: the guard only rejects, it never reads the body.
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

const stepUpContext: InteractionAuthenticationContext = {
  requestedAcrValues: [LogtoAcr.FirstFactor],
  selectedAcr: LogtoAcr.FirstFactor,
  mode: AuthenticationContextMode.StepUp,
  availableMethods: [VerificationType.Password],
  establishableMethods: [],
  enrollableFactors: [],
  subjectProofConnectors: [],
  maskedIdentifiers: {},
};

/** A sign-in with requested ACR: an authentication context without the step-up mode. */
const requestedAcrContext: InteractionAuthenticationContext = {
  requestedAcrValues: [LogtoAcr.FirstFactor],
  availableMethods: [VerificationType.Password],
  establishableMethods: [],
  enrollableFactors: [],
  subjectProofConnectors: [],
  maskedIdentifiers: {},
};

const renderGuard = (path = '/sign-in') =>
  renderWithPageContext(
    <Routes>
      <Route element={<StepUpEntryGuard />}>
        <Route path="/sign-in" element={<div>sign in form</div>} />
        <Route path="/register" element={<div>register form</div>} />
      </Route>
      <Route path="/step-up" element={<div>step-up landing</div>} />
    </Routes>,
    { initialEntries: [path] }
  );

describe('StepUpEntryGuard', () => {
  afterEach(() => {
    jest.resetAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutation -- reset the mocked flow cookie hint
    logtoCookies.isStepUp = undefined;
  });

  it('renders the entry route from the flow cookie without reading the interaction', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- stage the mocked flow cookie hint
    logtoCookies.isStepUp = false;

    renderGuard();

    expect(await screen.findByText('sign in form')).not.toBeNull();
    expect(screen.queryByText('step-up landing')).toBeNull();
    expect(mockedGetStepUpContext).not.toHaveBeenCalled();
  });

  it('returns to the step-up landing from the flow cookie without reading the interaction', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- stage the mocked flow cookie hint
    logtoCookies.isStepUp = true;

    renderGuard();

    expect(await screen.findByText('step-up landing')).not.toBeNull();
    expect(screen.queryByText('sign in form')).toBeNull();
    expect(mockedGetStepUpContext).not.toHaveBeenCalled();
  });

  it('renders the entry route when there is no interaction yet', async () => {
    mockedGetStepUpContext.mockRejectedValue(createRequestError('session.interaction_not_found'));

    renderGuard();

    expect(await screen.findByText('sign in form')).not.toBeNull();
    expect(screen.queryByText('step-up landing')).toBeNull();
    expect(mockedGetStepUpContext).toHaveBeenCalledTimes(1);
  });

  it('renders the entry route for a normal sign-in interaction without a context', async () => {
    mockedGetStepUpContext.mockResolvedValue(undefined);

    renderGuard('/register');

    expect(await screen.findByText('register form')).not.toBeNull();
    expect(screen.queryByText('step-up landing')).toBeNull();
  });

  it('renders the entry route for a sign-in with requested ACR but no step-up mode', async () => {
    mockedGetStepUpContext.mockResolvedValue(requestedAcrContext);

    renderGuard();

    expect(await screen.findByText('sign in form')).not.toBeNull();
    expect(screen.queryByText('step-up landing')).toBeNull();
  });

  it('sends a pure step-up interaction back to the step-up landing', async () => {
    mockedGetStepUpContext.mockResolvedValue(stepUpContext);

    renderGuard();

    expect(await screen.findByText('step-up landing')).not.toBeNull();
    expect(screen.queryByText('sign in form')).toBeNull();
  });

  it('blocks registration as well, never only the first entry route', async () => {
    mockedGetStepUpContext.mockResolvedValue(stepUpContext);

    renderGuard('/register');

    expect(await screen.findByText('step-up landing')).not.toBeNull();
    expect(screen.queryByText('register form')).toBeNull();
  });

  it('never renders the form while the mode is unknown', async () => {
    const deferred: { resolve?: (context: InteractionAuthenticationContext | undefined) => void } =
      {};
    mockedGetStepUpContext.mockImplementationOnce(
      async () =>
        new Promise<InteractionAuthenticationContext | undefined>((resolve) => {
          // eslint-disable-next-line @silverhand/fp/no-mutation -- the test controls the deferred check settlement
          deferred.resolve = resolve;
        })
    );

    renderGuard();

    expect(screen.queryByText('sign in form')).toBeNull();
    expect(screen.queryByText('step-up landing')).toBeNull();

    await act(async () => {
      deferred.resolve?.(stepUpContext);
    });

    expect(await screen.findByText('step-up landing')).not.toBeNull();
  });

  it('renders the entry route when the interaction cannot be read', async () => {
    mockedGetStepUpContext.mockRejectedValue(new Error('network down'));

    renderGuard();

    expect(await screen.findByText('sign in form')).not.toBeNull();
    expect(screen.queryByText('step-up landing')).toBeNull();
  });
});
