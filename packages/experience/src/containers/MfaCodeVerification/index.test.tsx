import { SignInIdentifier } from '@logto/schemas';
import { fireEvent, render, waitFor } from '@testing-library/react';

import useTrustedDeviceOptIn from '@/hooks/use-trusted-device-opt-in';

import MfaCodeVerification from '.';
import useMfaCodeVerification from './use-mfa-code-verification';
import useResendMfaVerificationCode from './use-resend-mfa-verification-code';

function mockTrustedDeviceOptIn() {
  return null;
}

jest.mock('@/hooks/use-trusted-device-opt-in');
jest.mock('./use-mfa-code-verification');
jest.mock('./use-resend-mfa-verification-code');
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
const mockedUseMfaCodeVerification = jest.mocked(useMfaCodeVerification);
const mockedUseResendMfaVerificationCode = jest.mocked(useResendMfaVerificationCode);

const renderVerification = (isVisible: boolean) => {
  const onSubmit = jest.fn().mockResolvedValue(undefined);
  mockedUseTrustedDeviceOptIn.mockReturnValue({
    durationDays: isVisible ? 30 : undefined,
    isChecked: false,
    setIsChecked: jest.fn(),
    createTrustedDevice: isVisible ? false : undefined,
  });
  mockedUseMfaCodeVerification.mockReturnValue({ errorMessage: undefined, onSubmit });
  mockedUseResendMfaVerificationCode.mockReturnValue({
    seconds: 30,
    isRunning: true,
    onResendVerificationCode: jest.fn(),
  });

  const result = render(
    <MfaCodeVerification identifierType={SignInIdentifier.Email} verificationId="verification-id" />
  );

  return { ...result, onSubmit };
};

describe('<MfaCodeVerification />', () => {
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
      expect(onSubmit).toBeCalledWith('123456');
    });
  });
});
