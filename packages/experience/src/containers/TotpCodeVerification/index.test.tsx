import { fireEvent, render, waitFor } from '@testing-library/react';

import useTrustedDeviceOptIn from '@/hooks/use-trusted-device-opt-in';
import { UserMfaFlow } from '@/types';

import TotpCodeVerification from '.';
import useTotpCodeVerification from './use-totp-code-verification';

function mockTrustedDeviceOptIn() {
  return null;
}

jest.mock('@/hooks/use-trusted-device-opt-in');
jest.mock('./use-totp-code-verification');
jest.mock('@/containers/TrustedDeviceOptIn', () => mockTrustedDeviceOptIn);
jest.mock('@/shared/components/VerificationCode', () => ({
  __esModule: true,
  default: ({ onChange }: { readonly onChange: (code: string[]) => void }) => (
    <button
      type="button"
      onClick={() => {
        onChange(['1', '2', '3', '4', '5', '6']);
      }}
    >
      Fill code
    </button>
  ),
}));

const mockedUseTrustedDeviceOptIn = jest.mocked(useTrustedDeviceOptIn);
const mockedUseTotpCodeVerification = jest.mocked(useTotpCodeVerification);

const renderVerification = (isVisible: boolean) => {
  const onSubmit = jest.fn().mockResolvedValue(undefined);
  mockedUseTrustedDeviceOptIn.mockReturnValue({
    durationDays: isVisible ? 30 : undefined,
    isChecked: false,
    setIsChecked: jest.fn(),
  });
  mockedUseTotpCodeVerification.mockReturnValue({ errorMessage: undefined, onSubmit });

  const result = render(<TotpCodeVerification flow={UserMfaFlow.MfaVerification} />);

  return { ...result, onSubmit };
};

describe('<TotpCodeVerification />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not auto-submit a complete code while trusted-device opt-in is visible', () => {
    const { getByRole, onSubmit } = renderVerification(true);

    fireEvent.click(getByRole('button', { name: 'Fill code' }));

    expect(onSubmit).not.toBeCalled();
  });

  it('keeps the existing auto-submit behavior when trusted-device opt-in is hidden', async () => {
    const { getByRole, onSubmit } = renderVerification(false);

    fireEvent.click(getByRole('button', { name: 'Fill code' }));

    await waitFor(() => {
      expect(onSubmit).toBeCalledWith('123456', { flow: UserMfaFlow.MfaVerification }, false);
    });
  });
});
