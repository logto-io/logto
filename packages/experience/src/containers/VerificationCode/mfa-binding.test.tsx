import {
  InteractionEvent,
  MfaFactor,
  SignInIdentifier,
  type VerificationCodeIdentifier,
} from '@logto/schemas';
import { act, fireEvent, waitFor } from '@testing-library/react';
import { HTTPError } from 'ky';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { verifyAndUpdateProfileWithVerificationCode } from '@/apis/experience';
import { bindMfa } from '@/apis/experience/mfa';
import { UserFlow } from '@/types';

import VerificationCode from '.';

const mockedStartBackupCodeBinding = jest.fn();
const mockedStartTotpBinding = jest.fn();

jest.mock('@/apis/experience', () => ({
  ...jest.requireActual('@/apis/experience'),
  verifyAndUpdateProfileWithVerificationCode: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/apis/experience/mfa', () => ({
  bindMfa: jest.fn(),
}));

jest.mock('@/hooks/use-start-backup-code-binding', () => ({
  __esModule: true,
  default: () => mockedStartBackupCodeBinding,
}));

jest.mock('@/hooks/use-start-totp-binding', () => ({
  __esModule: true,
  default: () => mockedStartTotpBinding,
}));

const createRequestError = (code: string, data?: unknown) => {
  const response = {
    status: 422,
    statusText: 'Unprocessable Entity',
    json: async () => ({ code, message: code, data }),
  } as unknown as Response;

  return new HTTPError(response, {} as Request, {} as never);
};

const fillVerificationCode = (container: HTMLElement) => {
  for (const input of container.querySelectorAll('input')) {
    act(() => {
      fireEvent.input(input, { target: { value: '1' } });
    });
  }
};

const renderMfaBindingVerification = (
  identifier: VerificationCodeIdentifier,
  factor: MfaFactor.EmailVerificationCode | MfaFactor.PhoneVerificationCode
) =>
  renderWithPageContext(
    <VerificationCode
      flow={UserFlow.Continue}
      identifier={identifier}
      verificationId="verification-id"
    />,
    {
      initialEntries: [
        {
          pathname: '/continue/verification-code',
          state: {
            interactionEvent: InteractionEvent.SignIn,
            availableFactors: [factor],
          },
        },
      ],
    }
  );

describe('Email and Phone MFA binding submit errors', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('starts backup-code binding when Email MFA binding submit requires it', async () => {
    jest
      .mocked(bindMfa)
      .mockRejectedValueOnce(createRequestError('session.mfa.backup_code_required'));

    const { container } = renderMfaBindingVerification(
      { type: SignInIdentifier.Email, value: 'foo@logto.io' },
      MfaFactor.EmailVerificationCode
    );

    fillVerificationCode(container);

    await waitFor(() => {
      expect(verifyAndUpdateProfileWithVerificationCode).toHaveBeenCalled();
      expect(bindMfa).toHaveBeenCalled();
      expect(mockedStartBackupCodeBinding).toHaveBeenCalledWith(true);
    });
  });

  it('starts additional-factor binding when Phone MFA binding submit suggests it', async () => {
    jest.mocked(bindMfa).mockRejectedValueOnce(
      createRequestError('session.mfa.suggest_additional_mfa', {
        availableFactors: [MfaFactor.TOTP],
        skippable: true,
        suggestion: true,
      })
    );

    const { container } = renderMfaBindingVerification(
      { type: SignInIdentifier.Phone, value: '18573333333' },
      MfaFactor.PhoneVerificationCode
    );

    fillVerificationCode(container);

    await waitFor(() => {
      expect(verifyAndUpdateProfileWithVerificationCode).toHaveBeenCalled();
      expect(bindMfa).toHaveBeenCalled();
      expect(mockedStartTotpBinding).toHaveBeenCalledWith(
        expect.objectContaining({
          availableFactors: [MfaFactor.TOTP],
          skippable: true,
          suggestion: true,
        }),
        true
      );
    });
  });
});
