import {
  MfaFactor,
  SignInIdentifier,
  VerificationType,
  type RequestErrorBody,
} from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import { act, renderHook } from '@testing-library/react';
import { HTTPError } from 'ky';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import UserInteractionContext, {
  type UserInteractionContextType,
} from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import {
  addMfa,
  getVerifiedRegisterCodeRecordId,
  sendSubjectVerificationCode,
  submitInteraction,
} from '@/apis/experience';
import { isNativeWebview } from '@/utils/native-sdk';

import useMfaErrorHandler from './use-mfa-error-handler';

const mockedNavigate = jest.fn();
const mockedRedirectTo = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/apis/experience', () => ({
  ...jest.requireActual('@/apis/experience'),
  addMfa: jest.fn(),
  getVerifiedRegisterCodeRecordId: jest.fn(),
  sendSubjectVerificationCode: jest.fn(),
  submitInteraction: jest.fn(),
}));

jest.mock('@/utils/native-sdk', () => ({
  isNativeWebview: jest.fn(() => false),
}));

jest.mock('./use-navigate-with-preserved-search-params', () => ({
  __esModule: true,
  default: () => mockedNavigate,
}));

jest.mock('./use-global-redirect-to', () => ({
  __esModule: true,
  default: () => mockedRedirectTo,
}));

jest.mock('./use-send-mfa-verification-code', () => ({
  __esModule: true,
  default: () => ({ onSubmit: jest.fn() }),
}));

jest.mock('./use-start-backup-code-binding', () => ({
  __esModule: true,
  default: () => jest.fn(),
}));

jest.mock('./use-start-totp-binding', () => ({
  __esModule: true,
  default: () => jest.fn(),
}));

jest.mock('./use-start-webauthn-processing', () => ({
  __esModule: true,
  default: () => jest.fn(),
}));

jest.mock('./use-toast', () => ({
  __esModule: true,
  default: () => ({ setToast: jest.fn() }),
}));

const mockedAddMfa = addMfa as jest.MockedFunction<typeof addMfa>;
const mockedGetVerifiedRegisterCodeRecordId =
  getVerifiedRegisterCodeRecordId as jest.MockedFunction<typeof getVerifiedRegisterCodeRecordId>;
const mockedSendSubjectVerificationCode = sendSubjectVerificationCode as jest.MockedFunction<
  typeof sendSubjectVerificationCode
>;
const mockedSubmitInteraction = submitInteraction as jest.MockedFunction<typeof submitInteraction>;
const mockedIsNativeWebview = isNativeWebview as jest.MockedFunction<typeof isNativeWebview>;

const createHttpError = (body: RequestErrorBody) =>
  new HTTPError(
    {
      status: 422,
      statusText: 'Unprocessable Entity',
      json: async () => body,
    } as unknown as Response,
    {} as Request,
    {} as never
  );

const createUserInteractionValue = (setVerificationId = jest.fn()): UserInteractionContextType => ({
  availableSsoConnectorsMap: new Map(),
  setSsoEmail: noop,
  ssoConnectors: [],
  setSsoConnectors: noop,
  setIdentifierInputValue: noop,
  setForgotPasswordIdentifierInputValue: noop,
  setVerificationId,
  verificationIdsMap: {},
  hasBoundPasskey: false,
  setHasBoundPasskey: noop,
  hasEnteredPassword: () => false,
  setHasEnteredPassword: noop,
  clearInteractionContextSessionStorage: noop,
});

const renderMfaErrorHandler = ({
  replace,
  setVerificationId = jest.fn(),
}: {
  replace?: boolean;
  setVerificationId?: jest.Mock;
} = {}) =>
  renderHook(() => useMfaErrorHandler({ replace }), {
    wrapper: ({ children }: { readonly children: ReactNode }) => (
      <MemoryRouter>
        <UserInteractionContext.Provider value={createUserInteractionValue(setVerificationId)}>
          {children}
        </UserInteractionContext.Provider>
      </MemoryRouter>
    ),
  });

describe('useMfaErrorHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockedIsNativeWebview.mockReturnValue(false);
  });

  it('does not carry unused error data through the suggest-MFA onboarding redirect', async () => {
    const { result } = renderMfaErrorHandler();
    const error: RequestErrorBody = {
      code: 'user.suggest_mfa',
      message: 'MFA suggested',
      data: { futureField: 'ignored' },
    };

    await act(async () => {
      await result.current['user.suggest_mfa']?.(error);
    });

    expect(mockedNavigate).toHaveBeenCalledWith(
      { pathname: '/mfa-onboarding' },
      { replace: undefined }
    );
  });

  it('masks unknown error data before forwarding MFA flow state', async () => {
    const { result } = renderMfaErrorHandler();
    const error: RequestErrorBody = {
      code: 'user.missing_mfa',
      message: 'MFA is missing',
      data: {
        availableFactors: [MfaFactor.TOTP, MfaFactor.WebAuthn],
        futureField: 'ignored',
      },
    };

    await act(async () => {
      await result.current['user.missing_mfa']?.(error);
    });

    expect(mockedNavigate).toHaveBeenCalledWith(
      { pathname: '/mfa-binding' },
      {
        replace: undefined,
        state: {
          availableFactors: [MfaFactor.TOTP, MfaFactor.WebAuthn],
        },
      }
    );
  });

  it.each([
    {
      factor: MfaFactor.EmailVerificationCode,
      identifierType: SignInIdentifier.Email,
      verificationType: VerificationType.EmailVerificationCode,
      masked: 'f***@logto.io',
    },
    {
      factor: MfaFactor.PhoneVerificationCode,
      identifierType: SignInIdentifier.Phone,
      verificationType: VerificationType.PhoneVerificationCode,
      masked: '****1234',
    },
  ])(
    'delegates single $factor binding with maskedIdentifiers',
    async ({ factor, identifierType, verificationType, masked }) => {
      const setVerificationId = jest.fn();
      mockedGetVerifiedRegisterCodeRecordId.mockResolvedValue(undefined);
      mockedSendSubjectVerificationCode.mockResolvedValue({ verificationId: 'vid-1' });

      const { result } = renderMfaErrorHandler({ replace: true, setVerificationId });
      const error: RequestErrorBody = {
        code: 'user.missing_mfa',
        message: 'MFA is missing',
        data: {
          availableFactors: [factor],
          maskedIdentifiers: { [factor]: masked },
          skippable: true,
        },
      };

      await act(async () => {
        await result.current['user.missing_mfa']?.(error);
      });

      expect(mockedGetVerifiedRegisterCodeRecordId).toHaveBeenCalledWith(verificationType);
      expect(mockedSendSubjectVerificationCode).toHaveBeenCalledWith(identifierType);
      expect(setVerificationId).toHaveBeenCalledWith(verificationType, 'vid-1');
      expect(mockedNavigate).toHaveBeenCalledWith(
        { pathname: `/mfa-binding/${factor}` },
        {
          replace: true,
          state: {
            availableFactors: [factor],
            maskedIdentifiers: { [factor]: masked },
            skippable: true,
          },
        }
      );
    }
  );

  it('forwards boundFactors and maskedIdentifiers on suggest_additional_mfa', async () => {
    const { result } = renderMfaErrorHandler({ replace: true });
    const error: RequestErrorBody = {
      code: 'session.mfa.suggest_additional_mfa',
      message: 'Suggest additional MFA',
      data: {
        availableFactors: [
          MfaFactor.TOTP,
          MfaFactor.PhoneVerificationCode,
          MfaFactor.EmailVerificationCode,
        ],
        maskedIdentifiers: {
          [MfaFactor.EmailVerificationCode]: 'alic****@logto.io',
          [MfaFactor.PhoneVerificationCode]: '****0000',
        },
        boundFactors: [MfaFactor.EmailVerificationCode],
        skippable: true,
        suggestion: true,
      },
    };

    await act(async () => {
      await result.current['session.mfa.suggest_additional_mfa']?.(error);
    });

    expect(mockedNavigate).toHaveBeenCalledWith(
      { pathname: '/mfa-binding' },
      {
        replace: true,
        state: {
          availableFactors: [
            MfaFactor.TOTP,
            MfaFactor.PhoneVerificationCode,
            MfaFactor.EmailVerificationCode,
          ],
          maskedIdentifiers: {
            [MfaFactor.EmailVerificationCode]: 'alic****@logto.io',
            [MfaFactor.PhoneVerificationCode]: '****0000',
          },
          boundFactors: [MfaFactor.EmailVerificationCode],
          skippable: true,
          suggestion: true,
        },
      }
    );
  });

  it('keeps an already-bound factor on the suggestion screen instead of looping in a native WebView', async () => {
    mockedIsNativeWebview.mockReturnValue(true);
    mockedGetVerifiedRegisterCodeRecordId.mockResolvedValue('reg-email-vid');
    mockedAddMfa.mockResolvedValue({} as never);

    const suggestAdditionalMfaError: RequestErrorBody = {
      code: 'session.mfa.suggest_additional_mfa',
      message: 'Suggest additional MFA',
      data: {
        availableFactors: [MfaFactor.WebAuthn, MfaFactor.EmailVerificationCode],
        maskedIdentifiers: {
          [MfaFactor.EmailVerificationCode]: 'alic****@logto.io',
        },
        boundFactors: [MfaFactor.EmailVerificationCode],
        skippable: true,
        suggestion: true,
      },
    };
    mockedSubmitInteraction.mockRejectedValue(createHttpError(suggestAdditionalMfaError));

    const { result } = renderMfaErrorHandler({ replace: true });
    const missingMfaError: RequestErrorBody = {
      code: 'user.missing_mfa',
      message: 'MFA is missing',
      data: {
        availableFactors: [MfaFactor.WebAuthn, MfaFactor.EmailVerificationCode],
        maskedIdentifiers: {
          [MfaFactor.EmailVerificationCode]: 'alic****@logto.io',
        },
      },
    };

    await act(async () => {
      await result.current['user.missing_mfa']?.(missingMfaError);
    });

    expect(mockedAddMfa).toHaveBeenCalledTimes(1);
    expect(mockedSubmitInteraction).toHaveBeenCalledTimes(1);
    expect(mockedSendSubjectVerificationCode).not.toHaveBeenCalled();
    expect(mockedNavigate).toHaveBeenCalledTimes(1);
    expect(mockedNavigate).toHaveBeenCalledWith(
      { pathname: '/mfa-binding' },
      {
        replace: true,
        state: {
          availableFactors: [MfaFactor.EmailVerificationCode],
          maskedIdentifiers: {
            [MfaFactor.EmailVerificationCode]: 'alic****@logto.io',
          },
          boundFactors: [MfaFactor.EmailVerificationCode],
          skippable: true,
          suggestion: true,
        },
      }
    );
  });

  it('keeps an already-bound factor on the suggestion screen in a native WebView when boundFactors is omitted', async () => {
    mockedIsNativeWebview.mockReturnValue(true);

    const { result } = renderMfaErrorHandler({ replace: true });
    const error: RequestErrorBody = {
      code: 'session.mfa.suggest_additional_mfa',
      message: 'Suggest additional MFA',
      data: {
        availableFactors: [MfaFactor.WebAuthn, MfaFactor.EmailVerificationCode],
        maskedIdentifiers: {
          [MfaFactor.EmailVerificationCode]: 'alic****@logto.io',
        },
        skippable: true,
        suggestion: true,
      },
    };

    await act(async () => {
      await result.current['session.mfa.suggest_additional_mfa']?.(error);
    });

    expect(mockedGetVerifiedRegisterCodeRecordId).not.toHaveBeenCalled();
    expect(mockedAddMfa).not.toHaveBeenCalled();
    expect(mockedSubmitInteraction).not.toHaveBeenCalled();
    expect(mockedSendSubjectVerificationCode).not.toHaveBeenCalled();
    expect(mockedNavigate).toHaveBeenCalledWith(
      { pathname: '/mfa-binding' },
      {
        replace: true,
        state: {
          availableFactors: [MfaFactor.EmailVerificationCode],
          maskedIdentifiers: {
            [MfaFactor.EmailVerificationCode]: 'alic****@logto.io',
          },
          skippable: true,
          suggestion: true,
        },
      }
    );
  });
});
