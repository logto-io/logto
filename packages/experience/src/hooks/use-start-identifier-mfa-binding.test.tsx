import { MfaFactor, SignInIdentifier, VerificationType } from '@logto/schemas';
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
  sendPrimaryVerificationCode,
  submitInteraction,
} from '@/apis/experience';
import { type MfaFlowState } from '@/types/guard';

import { type ErrorHandlers } from './use-error-handler';
import useStartIdentifierMfaBinding from './use-start-identifier-mfa-binding';

const mockedNavigate = jest.fn();
const mockedRedirectTo = jest.fn();

jest.mock('@/apis/experience', () => ({
  ...jest.requireActual('@/apis/experience'),
  addMfa: jest.fn(),
  getVerifiedRegisterCodeRecordId: jest.fn(),
  sendPrimaryVerificationCode: jest.fn(),
  submitInteraction: jest.fn(),
}));

jest.mock('./use-navigate-with-preserved-search-params', () => ({
  __esModule: true,
  default: () => mockedNavigate,
}));

jest.mock('./use-global-redirect-to', () => ({
  __esModule: true,
  default: () => mockedRedirectTo,
}));

const mockedAddMfa = addMfa as jest.MockedFunction<typeof addMfa>;
const mockedGetVerifiedRegisterCodeRecordId =
  getVerifiedRegisterCodeRecordId as jest.MockedFunction<typeof getVerifiedRegisterCodeRecordId>;
const mockedSendPrimaryVerificationCode = sendPrimaryVerificationCode as jest.MockedFunction<
  typeof sendPrimaryVerificationCode
>;
const mockedSubmitInteraction = submitInteraction as jest.MockedFunction<typeof submitInteraction>;

const createHttpError = (code: string, message = code) =>
  new HTTPError(
    {
      status: 422,
      statusText: 'Unprocessable Entity',
      json: async () => ({ code, message }),
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

const renderBindingHook = ({
  replace,
  submitErrorHandlers,
  setVerificationId = jest.fn(),
}: {
  replace?: boolean;
  submitErrorHandlers?: ErrorHandlers;
  setVerificationId?: jest.Mock;
} = {}) =>
  renderHook(() => useStartIdentifierMfaBinding({ replace, submitErrorHandlers }), {
    wrapper: ({ children }: { readonly children: ReactNode }) => (
      <MemoryRouter>
        <UserInteractionContext.Provider value={createUserInteractionValue(setVerificationId)}>
          {children}
        </UserInteractionContext.Provider>
      </MemoryRouter>
    ),
  });

const buildMaskedEmailState = (): MfaFlowState => {
  const maskedIdentifiers: Partial<NonNullable<MfaFlowState['maskedIdentifiers']>> = {
    [MfaFactor.EmailVerificationCode]: 'f***@logto.io',
  };

  return {
    availableFactors: [MfaFactor.EmailVerificationCode],
    maskedIdentifiers: maskedIdentifiers as MfaFlowState['maskedIdentifiers'],
  };
};

describe('useStartIdentifierMfaBinding', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates directly to the factor binding page when maskedIdentifiers has no entry', async () => {
    const { result } = renderBindingHook({ replace: true });
    const flowState = { availableFactors: [MfaFactor.EmailVerificationCode] };

    await act(async () => {
      await result.current(MfaFactor.EmailVerificationCode, flowState);
    });

    expect(mockedNavigate).toHaveBeenCalledWith(
      { pathname: '/mfa-binding/EmailVerificationCode' },
      { replace: true, state: flowState }
    );
    expect(mockedGetVerifiedRegisterCodeRecordId).not.toHaveBeenCalled();
    expect(mockedSendPrimaryVerificationCode).not.toHaveBeenCalled();
  });

  it('reuses a verified Register code record without sending a second code', async () => {
    mockedGetVerifiedRegisterCodeRecordId.mockResolvedValue('register-email-vid');
    mockedAddMfa.mockResolvedValue({} as never);
    mockedSubmitInteraction.mockResolvedValue({ redirectTo: 'https://example.com/callback' });

    const { result } = renderBindingHook();
    const flowState = buildMaskedEmailState();

    await act(async () => {
      await result.current(MfaFactor.EmailVerificationCode, flowState);
    });

    expect(mockedGetVerifiedRegisterCodeRecordId).toHaveBeenCalledWith(
      VerificationType.EmailVerificationCode
    );
    expect(mockedAddMfa).toHaveBeenCalledWith(
      MfaFactor.EmailVerificationCode,
      'register-email-vid'
    );
    expect(mockedSubmitInteraction).toHaveBeenCalledTimes(1);
    expect(mockedRedirectTo).toHaveBeenCalledWith('https://example.com/callback');
    expect(mockedSendPrimaryVerificationCode).not.toHaveBeenCalled();
  });

  it('forwards submit errors after reusing a verified Register code record', async () => {
    const suggestHandler = jest.fn();
    mockedGetVerifiedRegisterCodeRecordId.mockResolvedValue('register-email-vid');
    mockedAddMfa.mockResolvedValue({} as never);
    mockedSubmitInteraction.mockRejectedValue(
      createHttpError('session.mfa.suggest_additional_mfa')
    );

    const { result } = renderBindingHook({
      submitErrorHandlers: {
        'session.mfa.suggest_additional_mfa': suggestHandler,
      },
    });
    const flowState = buildMaskedEmailState();

    await act(async () => {
      await result.current(MfaFactor.EmailVerificationCode, flowState);
    });

    expect(suggestHandler).toHaveBeenCalledWith({
      code: 'session.mfa.suggest_additional_mfa',
      message: 'session.mfa.suggest_additional_mfa',
    });
    expect(mockedSendPrimaryVerificationCode).not.toHaveBeenCalled();
  });

  it('sends a primary verification code when there is no reusable register record or addMfa fails', async () => {
    const setVerificationId = jest.fn();
    mockedGetVerifiedRegisterCodeRecordId.mockResolvedValue(undefined);
    mockedSendPrimaryVerificationCode.mockResolvedValue({ verificationId: 'primary-email-vid' });

    const { result } = renderBindingHook({ replace: true, setVerificationId });
    const flowState = buildMaskedEmailState();

    await act(async () => {
      await result.current(MfaFactor.EmailVerificationCode, flowState);
    });

    expect(mockedSendPrimaryVerificationCode).toHaveBeenCalledWith(SignInIdentifier.Email);
    expect(setVerificationId).toHaveBeenCalledWith(
      VerificationType.EmailVerificationCode,
      'primary-email-vid'
    );
    expect(mockedNavigate).toHaveBeenCalledWith(
      { pathname: '/mfa-binding/EmailVerificationCode' },
      { replace: true, state: flowState }
    );

    // When Register has a record that addMfa rejects (e.g., secondary email), fall back to sending
    // a code to the user's primary address.
    jest.clearAllMocks();
    mockedGetVerifiedRegisterCodeRecordId.mockResolvedValue('other-email-vid');
    mockedAddMfa.mockRejectedValue(createHttpError('user.email_exists_in_profile'));
    mockedSendPrimaryVerificationCode.mockResolvedValue({ verificationId: 'fallback-email-vid' });

    await act(async () => {
      await result.current(MfaFactor.EmailVerificationCode, flowState);
    });

    expect(mockedSendPrimaryVerificationCode).toHaveBeenCalledWith(SignInIdentifier.Email);
    expect(setVerificationId).toHaveBeenCalledWith(
      VerificationType.EmailVerificationCode,
      'fallback-email-vid'
    );
  });
});
