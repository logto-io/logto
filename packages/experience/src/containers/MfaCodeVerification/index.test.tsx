import { SignInIdentifier } from '@logto/schemas';
import { fireEvent, render, waitFor } from '@testing-library/react';

import MfaCodeVerification from '.';
import useMfaCodeVerification from './use-mfa-code-verification';
import useResendMfaVerificationCode from './use-resend-mfa-verification-code';

jest.mock('./use-mfa-code-verification');
jest.mock('./use-resend-mfa-verification-code');
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

const mockedUseMfaCodeVerification = jest.mocked(useMfaCodeVerification);
const mockedUseResendMfaVerificationCode = jest.mocked(useResendMfaVerificationCode);

const renderVerification = () => {
  const onSubmit = jest.fn().mockResolvedValue(undefined);
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

  it('auto-submits a complete code', async () => {
    const { getByRole, onSubmit } = renderVerification();

    fireEvent.click(getByRole('button', { name: 'Fill code' }));

    await waitFor(() => {
      expect(onSubmit).toBeCalledWith('123456');
    });
  });
});
