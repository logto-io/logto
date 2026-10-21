import { AccountCenterControlValue, type AccountCenter } from '@logto/schemas';
import { act, fireEvent, waitFor } from '@testing-library/react';
import { HTTPError, type NormalizedOptions } from 'ky';
import { Route, Routes } from 'react-router-dom';

import type { PageContextType } from '@ac/Providers/PageContextProvider/PageContext';
import renderWithPageContext, {
  mockAccountCenterSettings,
} from '@ac/__mocks__/RenderWithPageContext';
import { updatePrimaryPhone } from '@ac/apis/account';
import { sendPhoneVerificationCode, verifyPhoneVerificationCode } from '@ac/apis/verification';
import { phoneRoute, phoneSuccessRoute } from '@ac/constants/routes';

import Phone from '.';

const mockGetAccessToken = jest.fn().mockResolvedValue('access-token');
const mockRequestStepUp = jest.fn();
const mockStartStepUp = jest.fn();

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    getAccessToken: mockGetAccessToken,
  }),
}));

jest.mock('@ac/hooks/use-step-up', () => ({
  __esModule: true,
  default: () => ({ requestStepUp: mockRequestStepUp, startStepUp: mockStartStepUp }),
  useStepUpEntry: () => ({ isReady: true, isChecking: false, hasFailed: false }),
}));

jest.mock('@ac/apis/account', () => ({
  updatePrimaryPhone: jest.fn(),
}));

jest.mock('@ac/apis/verification', () => ({
  sendPhoneVerificationCode: jest.fn(),
  verifyPhoneVerificationCode: jest.fn(),
}));

const createHttpError = (
  code: string,
  status: number,
  message = code,
  headers: Record<string, string> = {}
) =>
  new HTTPError(
    {
      status,
      headers: {
        get: (name: string) => headers[name.toLowerCase()] ?? null,
      },
      json: async () => ({ code, message }),
    } as unknown as Response,
    {} as Request,
    {} as NormalizedOptions
  );

const challenge =
  'Bearer error="insufficient_user_authentication", acr_values="urn:logto:acr:1fa", max_age="600"';

const mockSendCodeResult = {
  verificationRecordId: 'send-verification-record-id',
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
};

const mockVerifyCodeResult = {
  verificationRecordId: 'verify-verification-record-id',
};

/** US local number; SmartInputField prepends the default country calling code (1). */
const newPhoneLocalNumber = '4155550101';
const newPhone = `1${newPhoneLocalNumber}`;

type PhoneRenderOptions = {
  readonly pageContext?: Omit<Partial<PageContextType>, 'accountCenterSettings'> & {
    readonly accountCenterSettings?: Omit<Partial<AccountCenter>, 'fields'> & {
      readonly fields?: Partial<AccountCenter['fields']>;
    };
  };
  readonly initialEntries?: string[];
};

const renderPhone = ({ pageContext, initialEntries = [phoneRoute] }: PhoneRenderOptions = {}) =>
  renderWithPageContext(
    <Routes>
      <Route path={phoneRoute} element={<Phone />} />
      <Route path={phoneSuccessRoute} element={<div>Phone success page</div>} />
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
      },
    }
  );

const fillPhone = (container: HTMLElement, localNumber: string) => {
  const phoneInput = container.querySelector('input[name="phone"]');

  act(() => {
    fireEvent.input(phoneInput!, { target: { value: localNumber } });
  });
};

const submitSendStep = (getByText: ReturnType<typeof renderPhone>['getByText']) => {
  fireEvent.click(getByText('account_center.code_verification.send'));
};

const fillVerificationCode = (container: HTMLElement, code: string) => {
  const inputs = container.querySelectorAll('input[name^="phoneCode_"]');

  for (const [index, input] of inputs.entries()) {
    fireEvent.input(input, { target: { value: code[index] ?? '' } });
  }
};

const advanceToVerifyStep = async (
  container: HTMLElement,
  getByText: ReturnType<typeof renderPhone>['getByText'],
  localNumber = newPhoneLocalNumber
) => {
  fillPhone(container, localNumber);
  submitSendStep(getByText);

  await waitFor(() => {
    expect(getByText('account_center.phone.verification_title')).toBeTruthy();
  });
};

describe('<Phone />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetAccessToken.mockResolvedValue('access-token');
    jest.mocked(sendPhoneVerificationCode).mockResolvedValue(mockSendCodeResult);
    jest.mocked(verifyPhoneVerificationCode).mockResolvedValue(mockVerifyCodeResult);
    mockRequestStepUp.mockResolvedValue(false);
    jest.mocked(updatePrimaryPhone).mockResolvedValue(undefined);
  });

  it('shows an error page when phone editing is disabled', () => {
    const { getByText } = renderPhone({
      pageContext: {
        accountCenterSettings: {
          fields: {
            phone: AccountCenterControlValue.ReadOnly,
          },
        },
      },
    });

    expect(getByText('error.feature_not_enabled')).toBeTruthy();
  });

  it('shows a validation error when phone is empty', async () => {
    const { getByText, container } = renderPhone();

    submitSendStep(getByText);

    await waitFor(() => {
      expect(getByText('error.general_required')).toBeTruthy();
    });
    expect(sendPhoneVerificationCode).not.toHaveBeenCalled();
    expect(container.querySelector('input[name="phoneCode_0"]')).toBeNull();
  });

  it('sends a verification code and advances to the verification step', async () => {
    const { getByText, container } = renderPhone();

    fillPhone(container, newPhoneLocalNumber);
    submitSendStep(getByText);

    await waitFor(() => {
      expect(sendPhoneVerificationCode).toHaveBeenCalledWith('access-token', newPhone);
      expect(getByText('account_center.phone.verification_title')).toBeTruthy();
      expect(container.querySelector('input[name="phoneCode_0"]')).not.toBeNull();
    });
  });

  it('binds the primary phone and navigates to the success page', async () => {
    const refreshUserInfo = jest.fn().mockResolvedValue(undefined);
    const { getByText, container } = renderPhone({
      pageContext: {
        refreshUserInfo,
      },
    });

    await advanceToVerifyStep(container, getByText);
    fillVerificationCode(container, '123456');

    await waitFor(() => {
      expect(verifyPhoneVerificationCode).toHaveBeenCalledWith('access-token', {
        verificationRecordId: mockSendCodeResult.verificationRecordId,
        code: '123456',
        phone: newPhone,
      });
    });

    await waitFor(() => {
      expect(updatePrimaryPhone).toHaveBeenCalledWith('access-token', {
        phone: newPhone,
        newIdentifierVerificationRecordId: mockVerifyCodeResult.verificationRecordId,
      });
    });
    expect(refreshUserInfo).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(getByText('Phone success page')).toBeTruthy();
    });
  });

  it('shows a send-step error when the API rejects invalid input', async () => {
    const invalidInputMessage = 'Invalid phone number';
    jest
      .mocked(sendPhoneVerificationCode)
      .mockRejectedValue(createHttpError('guard.invalid_input', 422, invalidInputMessage));

    const { getByText, container } = renderPhone();

    fillPhone(container, newPhoneLocalNumber);
    submitSendStep(getByText);

    await waitFor(() => {
      expect(getByText(invalidInputMessage)).toBeTruthy();
    });
    expect(container.querySelector('input[name="phoneCode_0"]')).toBeNull();
  });

  it('shows a toast when sending the verification code fails unexpectedly', async () => {
    const setToast = jest.fn();
    const unexpectedMessage = 'Failed to send verification code';
    jest
      .mocked(sendPhoneVerificationCode)
      .mockRejectedValue(createHttpError('session.not_found', 401, unexpectedMessage));

    const { getByText, container } = renderPhone({
      pageContext: {
        setToast,
      },
    });

    fillPhone(container, newPhoneLocalNumber);
    submitSendStep(getByText);

    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith(unexpectedMessage);
    });
  });

  it('shows a verification error when the code is invalid', async () => {
    jest
      .mocked(verifyPhoneVerificationCode)
      .mockRejectedValue(createHttpError('verification_code.code_mismatch', 422));

    const { getByText, container } = renderPhone();

    await advanceToVerifyStep(container, getByText);
    fillVerificationCode(container, '123456');

    await waitFor(() => {
      expect(getByText('account_center.verification.error_invalid_code')).toBeTruthy();
    });
    expect(updatePrimaryPhone).not.toHaveBeenCalled();
  });

  it('resets the flow when the verification record is missing', async () => {
    jest
      .mocked(verifyPhoneVerificationCode)
      .mockRejectedValue(createHttpError('verification_record.not_found', 404));

    const { getByText, container } = renderPhone();

    await advanceToVerifyStep(container, getByText);
    fillVerificationCode(container, '123456');

    await waitFor(() => {
      expect(getByText('account_center.phone.title')).toBeTruthy();
      expect(getByText('account_center.verification.error_invalid_code')).toBeTruthy();
      expect(container.querySelector('input[name="phoneCode_0"]')).toBeNull();
    });
    expect(updatePrimaryPhone).not.toHaveBeenCalled();
  });

  it('starts a step-up on the RFC 9470 challenge of the binding request', async () => {
    mockRequestStepUp.mockResolvedValue(true);
    jest.mocked(updatePrimaryPhone).mockRejectedValue(
      createHttpError('verification_record.permission_denied', 401, undefined, {
        'www-authenticate': challenge,
      })
    );

    const { getByText, container } = renderPhone();

    await advanceToVerifyStep(container, getByText);
    fillVerificationCode(container, '123456');

    await waitFor(() => {
      expect(mockRequestStepUp).toHaveBeenCalledWith(expect.any(HTTPError), {
        type: 'enter-subpage',
      });
    });
  });
});
