import { fireEvent, render, waitFor } from '@testing-library/react';

import { UserMfaFlow } from '@/types';

import TotpCodeVerification from '.';
import useTotpCodeVerification from './use-totp-code-verification';

jest.mock('./use-totp-code-verification');
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

const mockedUseTotpCodeVerification = jest.mocked(useTotpCodeVerification);

const renderVerification = () => {
  const onSubmit = jest.fn().mockResolvedValue(undefined);
  mockedUseTotpCodeVerification.mockReturnValue({ errorMessage: undefined, onSubmit });

  const result = render(<TotpCodeVerification flow={UserMfaFlow.MfaVerification} />);

  return { ...result, onSubmit };
};

describe('<TotpCodeVerification />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('auto-submits a complete code', async () => {
    const { getByRole, onSubmit } = renderVerification();

    fireEvent.click(getByRole('button', { name: 'Fill code' }));

    await waitFor(() => {
      expect(onSubmit).toBeCalledWith('123456', { flow: UserMfaFlow.MfaVerification });
    });
  });
});
