import { type RequestErrorBody } from '@logto/schemas';
import { act, renderHook } from '@testing-library/react';

import useRegistrationDeniedErrorHandler from './use-registration-denied-error-handler';

const mockedNavigate = jest.fn();
const mockShow = jest.fn(async () => [true]);

jest.mock('./use-navigate-with-preserved-search-params', () => ({
  __esModule: true,
  default: () => mockedNavigate,
}));

jest.mock('./use-confirm-modal', () => ({
  usePromiseConfirmModal: () => ({ show: mockShow }),
}));

const buildError = (data?: unknown): RequestErrorBody => ({
  code: 'action.registration_denied',
  message: 'Your registration was declined.',
  data,
});

describe('useRegistrationDeniedErrorHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ['the message the action returned', { message: 'Use a work email.' }, 'Use a work email.'],
    [
      'the localized message without an action message',
      undefined,
      'Your registration was declined.',
    ],
    [
      'the localized message for an empty action message',
      { message: '' },
      'Your registration was declined.',
    ],
  ])('shows %s and navigates back', async (_, data, expectedContent) => {
    const { result } = renderHook(() => useRegistrationDeniedErrorHandler());

    await act(async () => {
      await result.current['action.registration_denied']?.(buildError(data));
    });

    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'alert', ModalContent: expectedContent })
    );
    expect(mockedNavigate).toHaveBeenCalledWith(-1);
  });

  it('calls onConfirm instead of navigating back when provided', async () => {
    const onConfirm = jest.fn();
    const { result } = renderHook(() => useRegistrationDeniedErrorHandler({ onConfirm }));

    await act(async () => {
      await result.current['action.registration_denied']?.(buildError());
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(mockedNavigate).not.toHaveBeenCalled();
  });
});
