import { AccountCenterControlValue, type AccountCenter } from '@logto/schemas';
import { act, fireEvent, waitFor } from '@testing-library/react';
import { HTTPError, type NormalizedOptions } from 'ky';
import { Route, Routes } from 'react-router-dom';

import type { PageContextType } from '@ac/Providers/PageContextProvider/PageContext';
import renderWithPageContext, {
  mockAccountCenterSettings,
} from '@ac/__mocks__/RenderWithPageContext';
import { updatePrimaryEmail } from '@ac/apis/account';
import {
  sendEmailVerificationCode,
  verifyEmailVerificationCode,
} from '@ac/apis/verification';
import { emailRoute, emailSuccessRoute } from '@ac/constants/routes';

import Email from '.';

const mockGetAccessToken = jest.fn().mockResolvedValue('access-token');

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    getAccessToken: mockGetAccessToken,
  }),
}));

jest.mock('@ac/apis/account', () => ({
  updatePrimaryEmail: jest.fn(),
}));

jest.mock('@ac/apis/verification', () => ({
  sendEmailVerificationCode: jest.fn(),
  verifyEmailVerificationCode: jest.fn(),
}));

jest.mock('@ac/components/VerificationMethodList', () => () => <div>Verification methods</div>);

const createHttpError = (code: string, status: number, message = code) =>
  new HTTPError(
    {
      status,
      json: async () => ({ code, message }),
    } as Response,
    {} as Request,
    {} as NormalizedOptions
  );

const mockSendCodeResult = {
  verificationRecordId: 'send-verification-record-id',
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
};

const mockVerifyCodeResult = {
  verificationRecordId: 'verify-verification-record-id',
};

type EmailRenderOptions = {
  readonly pageContext?: Omit<Partial<PageContextType>, 'accountCenterSettings'> & {
    readonly accountCenterSettings?: Omit<Partial<AccountCenter>, 'fields'> & {
      readonly fields?: Partial<AccountCenter['fields']>;
    };
  };
  readonly initialEntries?: string[];
};

const renderEmail = ({ pageContext, initialEntries = [emailRoute] }: EmailRenderOptions = {}) =>
  renderWithPageContext(
    <Routes>
      <Route path={emailRoute} element={<Email />} />
      <Route
        path={emailSuccessRoute}
        element={<div>Email success page</div>}
      />
    </Routes>,
    {
      initialEntries,
      future: {
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      },
    },
    {
      pageContext: {
        ...pageContext,
        accountCenterSettings: {
          ...mockAccountCenterSettings,
          ...pageContext?.accountCenterSettings,
          fields: {
            ...mockAccountCenterSettings.fields,
            ...pageContext?.accountCenterSettings?.fields,
          },
        },
        verificationId:
          pageContext && 'verificationId' in pageContext
            ? pageContext.verificationId
            : 'identity-verification-record-id',
      },
    }
  );

const fillEmail = (container: HTMLElement, email: string) => {
  const emailInput = container.querySelector('input[name="email"]');

  act(() => {
    fireEvent.input(emailInput!, { target: { value: email } });
  });
};

const submitSendStep = (getByText: ReturnType<typeof renderEmail>['getByText']) => {
  fireEvent.click(getByText('account_center.code_verification.send'));
};

const fillVerificationCode = (container: HTMLElement, code: string) => {
  const inputs = container.querySelectorAll('input[name^="emailCode_"]');

  for (const [index, input] of inputs.entries()) {
    fireEvent.input(input, { target: { value: code[index] ?? '' } });
  }
};

const advanceToVerifyStep = async (
  container: HTMLElement,
  getByText: ReturnType<typeof renderEmail>['getByText'],
  email = 'new.user@example.com'
) => {
  fillEmail(container, email);
  submitSendStep(getByText);

  await waitFor(() => {
    expect(getByText('account_center.email.verification_title')).toBeTruthy();
  });
};

describe('<Email />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetAccessToken.mockResolvedValue('access-token');
    jest.mocked(sendEmailVerificationCode).mockResolvedValue(mockSendCodeResult);
    jest.mocked(verifyEmailVerificationCode).mockResolvedValue(mockVerifyCodeResult);
    jest.mocked(updatePrimaryEmail).mockResolvedValue(undefined);
  });

  it('shows an error page when email editing is disabled', () => {
    const { getByText } = renderEmail({
      pageContext: {
        accountCenterSettings: {
          fields: {
            email: AccountCenterControlValue.ReadOnly,
          },
        },
      },
    });

    expect(getByText('error.feature_not_enabled')).toBeTruthy();
  });

  it('shows verification methods when identity is not verified', () => {
    const { getByText } = renderEmail({
      pageContext: {
        verificationId: undefined,
      },
    });

    expect(getByText('Verification methods')).toBeTruthy();
  });

  it('shows a validation error when email is empty', async () => {
    const { getByText, container } = renderEmail();

    submitSendStep(getByText);

    await waitFor(() => {
      expect(getByText('error.general_required')).toBeTruthy();
    });
    expect(sendEmailVerificationCode).not.toHaveBeenCalled();
    expect(container.querySelector('input[name="emailCode_0"]')).toBeNull();
  });

  it('shows a validation error when email format is invalid', async () => {
    const { getByText, container } = renderEmail();

    fillEmail(container, 'foo@bar');
    submitSendStep(getByText);

    await waitFor(() => {
      expect(getByText('error.invalid_email')).toBeTruthy();
    });
    expect(sendEmailVerificationCode).not.toHaveBeenCalled();
    expect(container.querySelector('input[name="emailCode_0"]')).toBeNull();
  });

  it('sends a verification code and advances to the verification step', async () => {
    const { getByText, container } = renderEmail();
    const newEmail = 'new.user@example.com';

    fillEmail(container, newEmail);
    submitSendStep(getByText);

    await waitFor(() => {
      expect(sendEmailVerificationCode).toHaveBeenCalledWith('access-token', newEmail);
      expect(getByText('account_center.email.verification_title')).toBeTruthy();
      expect(container.querySelector('input[name="emailCode_0"]')).not.toBeNull();
    });
  });

  it('binds the primary email and navigates to the success page', async () => {
    const refreshUserInfo = jest.fn().mockResolvedValue(undefined);
    const { getByText, container } = renderEmail({
      pageContext: {
        refreshUserInfo,
      },
    });
    const newEmail = 'new.user@example.com';

    await advanceToVerifyStep(container, getByText, newEmail);
    fillVerificationCode(container, '123456');

    await waitFor(() => {
      expect(verifyEmailVerificationCode).toHaveBeenCalledWith('access-token', {
        verificationRecordId: mockSendCodeResult.verificationRecordId,
        code: '123456',
        email: newEmail,
      });
    });

    await waitFor(() => {
      expect(updatePrimaryEmail).toHaveBeenCalledWith(
        'access-token',
        'identity-verification-record-id',
        {
          email: newEmail,
          newIdentifierVerificationRecordId: mockVerifyCodeResult.verificationRecordId,
        }
      );
    });
    expect(refreshUserInfo).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(getByText('Email success page')).toBeTruthy();
    });
  });

  it('shows a send-step error when the API rejects invalid input', async () => {
    const invalidInputMessage = 'Invalid email address';
    jest
      .mocked(sendEmailVerificationCode)
      .mockRejectedValue(createHttpError('guard.invalid_input', 422, invalidInputMessage));

    const { getByText, container } = renderEmail();

    fillEmail(container, 'bad@example.com');
    submitSendStep(getByText);

    await waitFor(() => {
      expect(getByText(invalidInputMessage)).toBeTruthy();
    });
    expect(container.querySelector('input[name="emailCode_0"]')).toBeNull();
  });

  it('shows a toast when sending the verification code fails unexpectedly', async () => {
    const setToast = jest.fn();
    const unexpectedMessage = 'Failed to send verification code';
    jest
      .mocked(sendEmailVerificationCode)
      .mockRejectedValue(createHttpError('session.not_found', 401, unexpectedMessage));

    const { getByText, container } = renderEmail({
      pageContext: {
        setToast,
      },
    });

    fillEmail(container, 'new.user@example.com');
    submitSendStep(getByText);

    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith(unexpectedMessage);
    });
  });

  it('shows a verification error when the code is invalid', async () => {
    jest
      .mocked(verifyEmailVerificationCode)
      .mockRejectedValue(createHttpError('verification_code.code_mismatch', 422));

    const { getByText, container } = renderEmail();

    await advanceToVerifyStep(container, getByText);
    fillVerificationCode(container, '123456');

    await waitFor(() => {
      expect(getByText('account_center.verification.error_invalid_code')).toBeTruthy();
    });
    expect(updatePrimaryEmail).not.toHaveBeenCalled();
  });

  it('resets the flow when the verification record is missing', async () => {
    jest
      .mocked(verifyEmailVerificationCode)
      .mockRejectedValue(createHttpError('verification_record.not_found', 404));

    const { getByText, container } = renderEmail();

    await advanceToVerifyStep(container, getByText);
    fillVerificationCode(container, '123456');

    await waitFor(() => {
      expect(getByText('account_center.email.title')).toBeTruthy();
      expect(getByText('account_center.verification.error_invalid_code')).toBeTruthy();
      expect(container.querySelector('input[name="emailCode_0"]')).toBeNull();
    });
    expect(updatePrimaryEmail).not.toHaveBeenCalled();
  });

  it('clears verification and prompts re-verification when binding permission is denied', async () => {
    const setVerificationId = jest.fn();
    const setToast = jest.fn();
    jest
      .mocked(updatePrimaryEmail)
      .mockRejectedValue(createHttpError('verification_record.permission_denied', 401));

    const { getByText, container } = renderEmail({
      pageContext: {
        setVerificationId,
        setToast,
      },
    });

    await advanceToVerifyStep(container, getByText);
    fillVerificationCode(container, '123456');

    await waitFor(() => {
      expect(setVerificationId).toHaveBeenCalledWith(undefined);
      expect(setToast).toHaveBeenCalledWith('account_center.verification.verification_required');
    });
  });
});
