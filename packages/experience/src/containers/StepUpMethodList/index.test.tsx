import {
  MfaFactor,
  type RequestErrorBody,
  SignInIdentifier,
  VerificationType,
} from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import UserInteractionContext, {
  type UserInteractionContextType,
} from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { sendStepUpVerificationCode } from '@/apis/experience';
import { type ErrorHandlers } from '@/hooks/use-error-handler';
import type useSendMfaVerificationCode from '@/hooks/use-send-mfa-verification-code';
import type useStartWebAuthnProcessing from '@/hooks/use-start-webauthn-processing';
import { UserMfaFlow } from '@/types';
import { type MfaFlowState } from '@/types/guard';
import { type StepUpMethod } from '@/utils/step-up';

import StepUpMethodList from '.';

const mockedNavigate = jest.fn();
const mockedHandleError = jest.fn<Promise<void>, [unknown, ErrorHandlers?]>();
const mockedSetVerificationId = jest.fn();
const mockedStartWebAuthnProcessing = jest.fn();
const mockedSendMfaVerificationCode = jest.fn();
const mockedUseStartWebAuthnProcessing = jest.fn<
  void,
  Parameters<typeof useStartWebAuthnProcessing>
>();
const mockedUseSendMfaVerificationCode = jest.fn<
  void,
  Parameters<typeof useSendMfaVerificationCode>
>();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    // Surface the interpolation options so the masked identifier can be asserted on.
    t: (key: string, options?: Record<string, unknown>) =>
      options && Object.keys(options).length > 0 ? `${key}:${JSON.stringify(options)}` : key,
    i18n: { dir: () => 'ltr' },
  }),
}));

jest.mock('@/hooks/use-navigate-with-preserved-search-params', () => ({
  __esModule: true,
  default: () => mockedNavigate,
}));

jest.mock('@/hooks/use-error-handler', () => ({
  __esModule: true,
  default: () => mockedHandleError,
}));

jest.mock('@/apis/experience', () => ({
  ...jest.requireActual('@/apis/experience'),
  sendStepUpVerificationCode: jest.fn(),
}));

jest.mock('@/hooks/use-start-webauthn-processing', () => ({
  __esModule: true,
  default: (...args: Parameters<typeof useStartWebAuthnProcessing>) => {
    mockedUseStartWebAuthnProcessing(...args);
    return mockedStartWebAuthnProcessing;
  },
}));

jest.mock('@/hooks/use-send-mfa-verification-code', () => ({
  __esModule: true,
  default: (...args: Parameters<typeof useSendMfaVerificationCode>) => {
    mockedUseSendMfaVerificationCode(...args);
    return { onSubmit: mockedSendMfaVerificationCode };
  },
}));

const mockedSendStepUpVerificationCode = sendStepUpVerificationCode as jest.MockedFunction<
  typeof sendStepUpVerificationCode
>;

const email = 'f***@logto.io';
const phone = '+1******1234';
const bothIdentifiers = { email, phone };
const verificationId = 'vid';

/** The error codes `useStepUpErrorHandler` handles; every step-up call composes them. */
const stepUpErrorCodes = new Set([
  'session.not_found',
  'session.interaction_not_found',
  'session.step_up.subject_not_found',
  'session.step_up.invalid_interaction_event',
  'session.identity_conflict',
  'session.step_up.forbidden_route',
  'session.step_up.acr_not_satisfied',
]);

const userInteractionContext: UserInteractionContextType = {
  availableSsoConnectorsMap: new Map(),
  setSsoEmail: noop,
  ssoConnectors: [],
  setSsoConnectors: noop,
  setIdentifierInputValue: noop,
  setForgotPasswordIdentifierInputValue: noop,
  verificationIdsMap: {},
  setVerificationId: mockedSetVerificationId,
  clearInteractionContextSessionStorage: noop,
  hasBoundPasskey: false,
  setHasBoundPasskey: noop,
};

/** Every method family, in the canonical server order. */
const allMethods: StepUpMethod[] = [
  VerificationType.Password,
  VerificationType.EmailVerificationCode,
  VerificationType.PhoneVerificationCode,
  VerificationType.TOTP,
  VerificationType.WebAuthn,
  VerificationType.BackupCode,
  VerificationType.MfaEmailVerificationCode,
  VerificationType.MfaPhoneVerificationCode,
];

/** The pinned-user first factors; their name keys are unique within this list. */
const firstFactorMethods: StepUpMethod[] = [
  VerificationType.Password,
  VerificationType.EmailVerificationCode,
  VerificationType.PhoneVerificationCode,
];

/** A first factor plus every enrolled MFA factor; the MFA code name keys are unique here. */
const mfaMethods: StepUpMethod[] = [
  VerificationType.Password,
  VerificationType.TOTP,
  VerificationType.WebAuthn,
  VerificationType.BackupCode,
  VerificationType.MfaEmailVerificationCode,
  VerificationType.MfaPhoneVerificationCode,
];

/** What the MFA pages receive when {@link mfaMethods} are displayed with both identifiers. */
const mfaFlowState: MfaFlowState = {
  availableFactors: [
    MfaFactor.TOTP,
    MfaFactor.WebAuthn,
    MfaFactor.BackupCode,
    MfaFactor.EmailVerificationCode,
    MfaFactor.PhoneVerificationCode,
  ],
  maskedIdentifiers: {
    [MfaFactor.EmailVerificationCode]: email,
    [MfaFactor.PhoneVerificationCode]: phone,
  },
};

/** The text of one button: its name key followed by its description. */
const label = (name: string, description: string) => `${name}${description}`;

/** The subtitle of a code method, as the mocked `t` renders the interpolated identifier. */
const sendTo = (key: 'mfa.send_to_email' | 'mfa.send_to_phone', identifier: string) =>
  `${key}:${JSON.stringify({ identifier })}`;

const renderList = (
  methods: readonly StepUpMethod[],
  maskedIdentifiers: { email?: string; phone?: string } = bothIdentifiers
) =>
  renderWithPageContext(
    <UserInteractionContext.Provider value={userInteractionContext}>
      <StepUpMethodList methods={methods} authenticationContext={{ maskedIdentifiers }} />
    </UserInteractionContext.Provider>
  );

/** The rendered text of every button, in DOM order. */
const getRenderedButtons = () => screen.getAllByRole('button').map((button) => button.textContent);

const clickMethod = async (nameKey: string) => {
  await act(async () => {
    fireEvent.click(screen.getByText(nameKey));
  });
};

describe('StepUpMethodList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSendStepUpVerificationCode.mockResolvedValue({ verificationId });
  });

  describe('rendering', () => {
    it('renders one button per method in the given order with its name and description', () => {
      renderList(allMethods, {});

      expect(getRenderedButtons()).toEqual([
        label('step_up.password', 'step_up.password_description'),
        label('mfa.email_verification_code', 'mfa.verify_email_verification_code_description'),
        label('mfa.phone_verification_code', 'mfa.verify_phone_verification_code_description'),
        label('mfa.totp', 'mfa.verify_totp_description'),
        label('mfa.webauthn', 'mfa.verify_webauthn_description'),
        label('mfa.backup_code', 'mfa.verify_backup_code_description'),
        label('mfa.email_verification_code', 'mfa.verify_email_verification_code_description'),
        label('mfa.phone_verification_code', 'mfa.verify_phone_verification_code_description'),
      ]);
    });

    it('keeps the server order rather than the canonical one', () => {
      renderList([VerificationType.BackupCode, VerificationType.Password], {});

      expect(getRenderedButtons()).toEqual([
        label('mfa.backup_code', 'mfa.verify_backup_code_description'),
        label('step_up.password', 'step_up.password_description'),
      ]);
    });

    it('renders nothing when no method is given', () => {
      renderList([]);

      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });

    it('shows the masked identifier as the subtitle of the code methods', () => {
      renderList(allMethods);

      expect(getRenderedButtons()).toEqual([
        label('step_up.password', 'step_up.password_description'),
        label('mfa.email_verification_code', sendTo('mfa.send_to_email', email)),
        label('mfa.phone_verification_code', sendTo('mfa.send_to_phone', phone)),
        label('mfa.totp', 'mfa.verify_totp_description'),
        label('mfa.webauthn', 'mfa.verify_webauthn_description'),
        label('mfa.backup_code', 'mfa.verify_backup_code_description'),
        label('mfa.email_verification_code', sendTo('mfa.send_to_email', email)),
        label('mfa.phone_verification_code', sendTo('mfa.send_to_phone', phone)),
      ]);
      expect(screen.queryByText('mfa.verify_email_verification_code_description')).toBeNull();
      expect(screen.queryByText('mfa.verify_phone_verification_code_description')).toBeNull();
    });

    it('falls back to the generic description of a code method without an identifier', () => {
      renderList(
        [
          VerificationType.EmailVerificationCode,
          VerificationType.MfaEmailVerificationCode,
          VerificationType.PhoneVerificationCode,
          VerificationType.MfaPhoneVerificationCode,
        ],
        { phone }
      );

      expect(getRenderedButtons()).toEqual([
        label('mfa.email_verification_code', 'mfa.verify_email_verification_code_description'),
        label('mfa.email_verification_code', 'mfa.verify_email_verification_code_description'),
        label('mfa.phone_verification_code', sendTo('mfa.send_to_phone', phone)),
        label('mfa.phone_verification_code', sendTo('mfa.send_to_phone', phone)),
      ]);
      expect(screen.queryByText(/^mfa\.send_to_email/)).toBeNull();
    });
  });

  describe('selecting a first factor', () => {
    it('opens the step-up password page for Password', async () => {
      renderList(firstFactorMethods);

      await clickMethod('step_up.password');

      expect(mockedNavigate).toHaveBeenCalledTimes(1);
      expect(mockedNavigate).toHaveBeenCalledWith('/step-up/password', { replace: undefined });
      expect(mockedSendStepUpVerificationCode).not.toHaveBeenCalled();
      expect(mockedSetVerificationId).not.toHaveBeenCalled();
    });

    it.each([
      {
        method: VerificationType.EmailVerificationCode,
        nameKey: 'mfa.email_verification_code',
        identifier: SignInIdentifier.Email,
      },
      {
        method: VerificationType.PhoneVerificationCode,
        nameKey: 'mfa.phone_verification_code',
        identifier: SignInIdentifier.Phone,
      },
    ])(
      'sends the pinned-user code by type only, stores its id, then opens the code page for $method',
      async ({ method, nameKey, identifier }) => {
        renderList(firstFactorMethods);

        await clickMethod(nameKey);

        await waitFor(() => {
          expect(mockedNavigate).toHaveBeenCalledWith('/step-up/verification-code', {
            replace: undefined,
          });
        });
        expect(mockedNavigate).toHaveBeenCalledTimes(1);
        expect(mockedSendStepUpVerificationCode).toHaveBeenCalledTimes(1);
        expect(mockedSendStepUpVerificationCode).toHaveBeenCalledWith(identifier);
        expect(mockedSetVerificationId).toHaveBeenCalledTimes(1);
        expect(mockedSetVerificationId).toHaveBeenCalledWith(method, verificationId);
        // The next page reads the id from the context, so it must be stored before navigating.
        const [storedAt] = mockedSetVerificationId.mock.invocationCallOrder;
        const [navigatedAt] = mockedNavigate.mock.invocationCallOrder;
        expect(storedAt).toBeLessThan(navigatedAt ?? Number.NaN);
        expect(mockedHandleError).not.toHaveBeenCalled();
      }
    );

    it('hands a failed code request to the error handler with the step-up handlers and stays', async () => {
      const error = new Error('Failed to send the code');
      mockedSendStepUpVerificationCode.mockRejectedValueOnce(error);
      renderList(firstFactorMethods);

      await clickMethod('mfa.email_verification_code');

      await waitFor(() => {
        expect(mockedHandleError).toHaveBeenCalledTimes(1);
      });
      const [handledError, errorHandlers] = mockedHandleError.mock.calls[0] ?? [];
      expect(handledError).toBe(error);
      expect(new Set(Object.keys(errorHandlers ?? {}))).toEqual(stepUpErrorCodes);
      expect(mockedNavigate).not.toHaveBeenCalled();
      expect(mockedSetVerificationId).not.toHaveBeenCalled();

      // A gone session is handled by the step-up handlers, not by the default toast.
      await errorHandlers?.['session.interaction_not_found']?.({
        code: 'session.interaction_not_found',
        message: 'Interaction not found.',
        data: {},
      });

      expect(mockedNavigate).toHaveBeenCalledTimes(1);
      expect(mockedNavigate).toHaveBeenCalledWith('/unknown-session', { replace: true });
    });
  });

  describe('selecting an MFA factor', () => {
    it.each([
      { nameKey: 'mfa.totp', factor: MfaFactor.TOTP },
      { nameKey: 'mfa.backup_code', factor: MfaFactor.BackupCode },
    ])(
      'opens the MFA verification page of $factor with the flow state of the displayed methods',
      async ({ nameKey, factor }) => {
        renderList(mfaMethods);

        await clickMethod(nameKey);

        expect(mockedNavigate).toHaveBeenCalledTimes(1);
        expect(mockedNavigate).toHaveBeenCalledWith(`/${UserMfaFlow.MfaVerification}/${factor}`, {
          replace: undefined,
          state: mfaFlowState,
        });
        expect(mockedStartWebAuthnProcessing).not.toHaveBeenCalled();
        expect(mockedSendMfaVerificationCode).not.toHaveBeenCalled();
        expect(mockedSendStepUpVerificationCode).not.toHaveBeenCalled();
      }
    );

    it('starts the WebAuthn verification ceremony with the flow state', async () => {
      renderList(mfaMethods);

      await clickMethod('mfa.webauthn');

      expect(mockedStartWebAuthnProcessing).toHaveBeenCalledTimes(1);
      expect(mockedStartWebAuthnProcessing).toHaveBeenCalledWith(
        UserMfaFlow.MfaVerification,
        mfaFlowState,
        undefined
      );
      expect(mockedNavigate).not.toHaveBeenCalled();
      expect(mockedSendMfaVerificationCode).not.toHaveBeenCalled();
    });

    it.each([
      { nameKey: 'mfa.email_verification_code', identifier: SignInIdentifier.Email },
      { nameKey: 'mfa.phone_verification_code', identifier: SignInIdentifier.Phone },
    ])(
      'sends the MFA code for $identifier through the MFA hook with the flow state',
      async ({ nameKey, identifier }) => {
        renderList(mfaMethods);

        await clickMethod(nameKey);

        expect(mockedSendMfaVerificationCode).toHaveBeenCalledTimes(1);
        expect(mockedSendMfaVerificationCode).toHaveBeenCalledWith(identifier, mfaFlowState);
        // The pinned-user code API is not used for an enrolled MFA factor.
        expect(mockedSendStepUpVerificationCode).not.toHaveBeenCalled();
        expect(mockedNavigate).not.toHaveBeenCalled();
        expect(mockedStartWebAuthnProcessing).not.toHaveBeenCalled();
      }
    );

    it('omits the identifiers the server did not provide from the flow state', async () => {
      renderList([VerificationType.TOTP, VerificationType.MfaEmailVerificationCode], { phone });

      await clickMethod('mfa.totp');

      expect(mockedNavigate).toHaveBeenCalledWith(
        `/${UserMfaFlow.MfaVerification}/${MfaFactor.TOTP}`,
        {
          replace: undefined,
          state: {
            availableFactors: [MfaFactor.TOTP, MfaFactor.EmailVerificationCode],
            maskedIdentifiers: {},
          },
        }
      );
    });
  });

  describe('error handling of the MFA hooks', () => {
    const acrNotSatisfied: RequestErrorBody = {
      code: 'session.step_up.acr_not_satisfied',
      message: 'The selected class is not satisfied.',
      data: {},
    };

    it('wires the step-up error handlers into the WebAuthn and MFA code hooks', async () => {
      renderList(mfaMethods);

      const [webAuthnOptions] = mockedUseStartWebAuthnProcessing.mock.calls[0] ?? [];
      const [mfaCodeOptions] = mockedUseSendMfaVerificationCode.mock.calls[0] ?? [];

      expect(new Set(Object.keys(webAuthnOptions?.errorHandlers ?? {}))).toEqual(stepUpErrorCodes);
      // The list passes no `replace`, and both hooks share the one memoized handler set.
      expect(mfaCodeOptions).toEqual({ errorHandlers: webAuthnOptions?.errorHandlers });
      expect(mfaCodeOptions?.errorHandlers).toBe(webAuthnOptions?.errorHandlers);

      await webAuthnOptions?.errorHandlers?.['session.step_up.acr_not_satisfied']?.(
        acrNotSatisfied
      );

      expect(mockedNavigate).toHaveBeenCalledTimes(1);
      expect(mockedNavigate).toHaveBeenCalledWith('/step-up', { replace: true });
    });
  });
});
