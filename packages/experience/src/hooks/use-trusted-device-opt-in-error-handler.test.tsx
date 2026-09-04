import { InteractionEvent, type RequestErrorBody } from '@logto/schemas';
import { act, renderHook } from '@testing-library/react';

import useTrustedDeviceOptInErrorHandler from './use-trusted-device-opt-in-error-handler';

const mockedNavigate = jest.fn();
const mockedSetToast = jest.fn();

jest.mock('./use-navigate-with-preserved-search-params', () => ({
  __esModule: true,
  default: () => mockedNavigate,
}));

jest.mock('./use-toast', () => ({
  __esModule: true,
  default: () => ({ setToast: mockedSetToast }),
}));

describe('useTrustedDeviceOptInErrorHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to the dedicated page with validated error data', async () => {
    const { result } = renderHook(() =>
      useTrustedDeviceOptInErrorHandler(InteractionEvent.Register)
    );
    const error: RequestErrorBody = {
      code: 'session.trusted_device_suggest_opt_in',
      message: 'Choose whether to trust this device.',
      data: { durationDays: 30, futureField: 'ignored' },
    };

    await act(async () => {
      await result.current['session.trusted_device_suggest_opt_in']?.(error);
    });

    expect(mockedNavigate).toHaveBeenCalledWith(
      { pathname: '/trusted-device' },
      {
        replace: true,
        state: { durationDays: 30, interactionEvent: InteractionEvent.Register },
      }
    );
    expect(mockedSetToast).not.toHaveBeenCalled();
  });

  it('shows the server message when error data is invalid', async () => {
    const { result } = renderHook(() => useTrustedDeviceOptInErrorHandler(InteractionEvent.SignIn));
    const error: RequestErrorBody = {
      code: 'session.trusted_device_suggest_opt_in',
      message: 'Invalid trusted-device data',
      data: { durationDays: '30' },
    };

    await act(async () => {
      await result.current['session.trusted_device_suggest_opt_in']?.(error);
    });

    expect(mockedSetToast).toHaveBeenCalledWith('Invalid trusted-device data');
    expect(mockedNavigate).not.toHaveBeenCalled();
  });
});
