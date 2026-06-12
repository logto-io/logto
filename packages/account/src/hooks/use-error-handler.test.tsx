import { fireEvent, screen, waitFor } from '@testing-library/react';
import { HTTPError, type NormalizedOptions } from 'ky';

import ReauthPromptProvider from '@ac/Providers/ReauthPromptProvider';
import renderWithPageContext from '@ac/__mocks__/RenderWithPageContext';
import { sessionStorage } from '@ac/utils/session-storage';

import useErrorHandler, { type ErrorHandlers } from './use-error-handler';

const mockSignIn = jest.fn();

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    signIn: mockSignIn,
  }),
}));

const createHttpError = (code: string, status: number, message = code) =>
  new HTTPError(
    {
      status,
      json: async () => ({ code, message }),
    } as Response,
    {} as Request,
    {} as NormalizedOptions
  );

const TestButton = ({
  error,
  errorHandlers,
}: {
  readonly error: unknown;
  readonly errorHandlers?: ErrorHandlers;
}) => {
  const handleError = useErrorHandler();

  return (
    <button
      type="button"
      onClick={() => {
        void handleError(error, errorHandlers);
      }}
    >
      Trigger error
    </button>
  );
};

const renderTestButton = (error: unknown, errorHandlers?: ErrorHandlers) =>
  renderWithPageContext(
    <ReauthPromptProvider>
      <TestButton error={error} errorHandlers={errorHandlers} />
    </ReauthPromptProvider>,
    {
      future: {
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      },
    }
  );

describe('useErrorHandler', () => {
  beforeEach(() => {
    mockSignIn.mockResolvedValue(undefined);
    window.history.replaceState({}, '', '/account/security');
    window.sessionStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('prompts the user to sign in again for auth.unauthorized 401 errors', async () => {
    renderTestButton(createHttpError('auth.unauthorized', 401));

    fireEvent.click(screen.getByText('Trigger error'));

    await waitFor(() => {
      expect(screen.getByText('error.invalid_session')).not.toBeNull();
    });

    fireEvent.click(screen.getByText('action.sign_in'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({ redirectUri: 'http://localhost/account' });
    });
    expect(sessionStorage.getRouteRestore()).not.toBeUndefined();
  });

  it('prefers explicit error handlers over the default reauth prompt', async () => {
    const handler = jest.fn();
    renderTestButton(createHttpError('auth.unauthorized', 401), {
      'auth.unauthorized': handler,
    });

    fireEvent.click(screen.getByText('Trigger error'));

    await waitFor(() => {
      expect(handler).toHaveBeenCalledWith({
        code: 'auth.unauthorized',
        message: 'auth.unauthorized',
      });
    });
    expect(screen.queryByText('error.invalid_session')).toBeNull();
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});
