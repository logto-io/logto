import { experience } from '@logto/schemas';
import { act, renderHook, waitFor } from '@testing-library/react';
import { HTTPError } from 'ky';
import { MemoryRouter } from 'react-router-dom';

import useErrorHandler from './use-error-handler';

const mockedNavigate = jest.fn();
const mockedSetToast = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('./use-toast', () => ({
  __esModule: true,
  default: () => ({ toast: '', setToast: mockedSetToast }),
}));

const createRequestError = (code: string, message = code) => {
  const response = {
    status: 401,
    statusText: 'Unauthorized',
    json: async () => ({ code, message }),
  } as unknown as Response;

  return new HTTPError(response, {} as Request, {} as never);
};

const renderErrorHandler = () =>
  renderHook(() => useErrorHandler(), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });

describe('useErrorHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to the account-suspended page for user.suspended by default', async () => {
    const { result } = renderErrorHandler();

    await act(async () => {
      await result.current(createRequestError('user.suspended', 'This account is suspended.'));
    });

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: `/${experience.routes.accountSuspended}` }),
        { replace: true }
      );
    });
    expect(mockedSetToast).not.toHaveBeenCalled();
  });

  it('lets a specific handler override the terminal suspended navigation', async () => {
    const { result } = renderErrorHandler();
    const specificHandler = jest.fn();

    await act(async () => {
      await result.current(createRequestError('user.suspended'), {
        'user.suspended': specificHandler,
      });
    });

    expect(specificHandler).toHaveBeenCalled();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it('prefers the terminal suspended path over a global handler', async () => {
    const { result } = renderErrorHandler();
    const globalHandler = jest.fn();

    await act(async () => {
      await result.current(createRequestError('user.suspended'), {
        global: globalHandler,
      });
    });

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: `/${experience.routes.accountSuspended}` }),
        { replace: true }
      );
    });
    expect(globalHandler).not.toHaveBeenCalled();
  });

  it('falls back to toast for unhandled errors', async () => {
    const { result } = renderErrorHandler();
    const message = 'Something unexpected happened';

    await act(async () => {
      await result.current(createRequestError('session.invalid_credentials', message));
    });

    expect(mockedSetToast).toHaveBeenCalledWith(message);
    expect(mockedNavigate).not.toHaveBeenCalled();
  });
});
