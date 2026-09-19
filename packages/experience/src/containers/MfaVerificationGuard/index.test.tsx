import { type LogtoErrorCode } from '@logto/phrases';
import {
  AuthenticationContextMode,
  type InteractionAuthenticationContext,
  LogtoAcr,
  MfaFactor,
  VerificationType,
} from '@logto/schemas';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import api from '@/apis/api';
import { type ErrorHandlers } from '@/hooks/use-error-handler';
import { setupI18nForTesting } from '@/jest.setup';
import BackupCodeVerification from '@/pages/MfaVerification/BackupCodeVerification';
import EmailVerificationCode from '@/pages/MfaVerification/EmailVerificationCode';
import PhoneVerificationCode from '@/pages/MfaVerification/PhoneVerificationCode';
import TotpVerification from '@/pages/MfaVerification/TotpVerification';
import WebAuthnVerification from '@/pages/MfaVerification/WebAuthnVerification';
import { type MfaFlowState, type WebAuthnState } from '@/types/guard';

import MfaVerificationGuard from '.';

const mockRedirect = jest.fn();
const mockHandleError = jest.fn<Promise<void>, [unknown, ErrorHandlers?]>();

class RequestError extends Error {
  constructor(readonly code: LogtoErrorCode) {
    super(code);
  }
}

jest.mock('@/apis/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));
jest.mock('@/hooks/use-global-redirect-to', () => ({
  __esModule: true,
  default: () => mockRedirect,
}));
jest.mock('@/hooks/use-error-handler', () => ({
  __esModule: true,
  default: () => mockHandleError,
}));
jest.mock('@simplewebauthn/browser', () => ({
  browserSupportsWebAuthn: () => true,
  startAuthentication: jest.fn(),
  startRegistration: jest.fn(),
}));
jest.mock('react-timer-hook', () => ({
  useTimer: () => ({ seconds: 0, isRunning: false, restart: jest.fn() }),
}));

const context: InteractionAuthenticationContext = {
  mode: AuthenticationContextMode.StepUp,
  requestedAcrValues: [LogtoAcr.Mfa],
  selectedAcr: LogtoAcr.Mfa,
  availableMethods: [VerificationType.TOTP, VerificationType.Password],
  maskedIdentifiers: { email: 'm***@example.com', phone: '+1***9876' },
  establishableMethods: [],
  enrollableFactors: [],
  subjectProofConnectors: [],
};
const authenticationOptions = { challenge: 'challenge', userVerification: 'required' };
const mockedGet = jest.mocked(api.get);
const mockedPost = jest.mocked(api.post);

const setContext = (value?: InteractionAuthenticationContext) => {
  mockedGet.mockReturnValue({
    json: async () => ({ authenticationContext: value }),
  } as unknown as ReturnType<typeof api.get>);
};

const renderPage = (factor: MfaFactor, state?: MfaFlowState | WebAuthnState) =>
  renderWithPageContext(
    <UserInteractionContextProvider>
      <Routes>
        <Route path="/mfa-verification" element={<MfaVerificationGuard />}>
          <Route path={MfaFactor.TOTP} element={<TotpVerification />} />
          <Route path={MfaFactor.BackupCode} element={<BackupCodeVerification />} />
          <Route path={MfaFactor.WebAuthn} element={<WebAuthnVerification />} />
          <Route path={MfaFactor.EmailVerificationCode} element={<EmailVerificationCode />} />
          <Route path={MfaFactor.PhoneVerificationCode} element={<PhoneVerificationCode />} />
        </Route>
        <Route path="/step-up" element={<div>step-up chooser</div>} />
        <Route path="/unknown-session" element={<div>invalid interaction</div>} />
      </Routes>
    </UserInteractionContextProvider>,
    { initialEntries: [{ pathname: `/mfa-verification/${factor}`, state }] }
  );

beforeEach(async () => {
  jest.clearAllMocks();
  sessionStorage.clear();
  await setupI18nForTesting({
    translation: { description: { resend_passcode: '<a>Resend code</a>' } },
  });
  setContext(context);
  mockedPost.mockReturnValue({
    json: async () => ({
      redirectTo: 'https://client.example/callback',
      verificationId: 'challenge-id',
      authenticationOptions,
    }),
  } as unknown as ReturnType<typeof api.post>);
  jest.mocked(startAuthentication).mockResolvedValue({
    id: 'credential',
    response: { signature: 'signature' },
  } as Awaited<ReturnType<typeof startAuthentication>>);
  mockHandleError.mockImplementation(async (error, handlers) => {
    if (error instanceof RequestError) {
      await handlers?.[error.code]?.({
        code: error.code,
        message: error.message,
        data: {},
      });
    }
  });
});

it.each([
  [MfaFactor.TOTP, VerificationType.TOTP, 'mfa.enter_one_time_code', '/totp/verify'],
  [
    MfaFactor.BackupCode,
    VerificationType.BackupCode,
    'mfa.enter_a_backup_code',
    '/backup-code/verify',
  ],
  [
    MfaFactor.WebAuthn,
    VerificationType.WebAuthn,
    'mfa.verify_via_passkey',
    '/web-authn/authentication/verify',
  ],
  [
    MfaFactor.EmailVerificationCode,
    VerificationType.MfaEmailVerificationCode,
    'mfa.enter_email_verification_code',
    '/mfa-verification-code/verify',
  ],
  [
    MfaFactor.PhoneVerificationCode,
    VerificationType.MfaPhoneVerificationCode,
    'mfa.enter_phone_verification_code',
    '/mfa-verification-code/verify',
  ],
] as const)(
  'restores %s without route state and verifies then submits without identification',
  async (factor, method, title, endpoint) => {
    setContext({ ...context, availableMethods: [method, VerificationType.Password] });
    const { container } = renderPage(factor);
    await screen.findByText(title);
    expect(mockedGet).toHaveBeenCalledWith('/api/experience/interaction');
    expect(api.put).not.toHaveBeenCalled();

    if (factor === MfaFactor.WebAuthn) {
      fireEvent.click(screen.getByRole('button', { name: 'action.verify_via_passkey' }));
    } else if (factor === MfaFactor.BackupCode) {
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'backup-123' } });
      fireEvent.submit(container.querySelector('form')!);
    } else {
      const inputs = container.querySelectorAll('input');
      for (const [index, input] of [...inputs].entries()) {
        fireEvent.input(input, { target: { value: String(index + 1) } });
      }
    }

    await waitFor(() => {
      expect(mockRedirect).toHaveBeenCalledWith('https://client.example/callback');
    });
    const paths = mockedPost.mock.calls.map(([path]) => String(path));
    expect(paths.slice(-2)).toEqual([
      `/api/experience/verification${endpoint}`,
      '/api/experience/submit',
    ]);
    expect(
      paths.some((path) =>
        /identification|registration|mfa-binding|trusted-device|mfa-skipped/.test(path)
      )
    ).toBe(false);
    expect(startRegistration).not.toHaveBeenCalled();
    expect(screen.queryByText('action.skip')).toBeNull();
    expect(screen.queryByText('mfa.link_another_mfa_factor')).toBeNull();
  }
);

it('shows the switch link for one MFA factor plus a first factor and returns to step-up', async () => {
  renderPage(MfaFactor.TOTP);
  const link = await screen.findByRole('link', { name: 'mfa.try_another_verification_method' });
  expect(link.getAttribute('href')).toBe('/step-up');
  fireEvent.click(link);
  await screen.findByText('step-up chooser');
});

it('uses the fresh server list instead of stale route factors', async () => {
  setContext({ ...context, availableMethods: [VerificationType.TOTP] });
  renderPage(MfaFactor.TOTP, {
    isStepUp: true,
    availableFactors: [MfaFactor.TOTP, MfaFactor.WebAuthn],
  });
  await screen.findByText('mfa.enter_one_time_code');
  expect(screen.queryByText('mfa.try_another_verification_method')).toBeNull();
});

it('returns an unavailable factor to the server-driven chooser', async () => {
  setContext({ ...context, availableMethods: [VerificationType.Password] });
  renderPage(MfaFactor.TOTP);
  await screen.findByText('step-up chooser');
  expect(mockedPost).not.toHaveBeenCalled();
});

it('preserves ordinary MFA state and its factor switch without fetching step-up', async () => {
  renderPage(MfaFactor.TOTP, { availableFactors: [MfaFactor.TOTP, MfaFactor.BackupCode] });
  await screen.findByText('mfa.enter_one_time_code');
  expect(
    screen.getByRole('link', { name: 'mfa.try_another_verification_method' }).getAttribute('href')
  ).toBe('/mfa-verification');
  expect(mockedGet).not.toHaveBeenCalled();
});

it('does not trust a step-up navigation hint without server context', async () => {
  setContext(undefined);
  renderPage(MfaFactor.TOTP, { isStepUp: true, availableFactors: [MfaFactor.TOTP] });
  await screen.findByText('error.invalid_session');
  expect(screen.queryByText('mfa.enter_one_time_code')).toBeNull();
});

it('keeps SignIn-with-ACR in the normal MFA flow even when arriving from the step-up chooser', async () => {
  setContext({ ...context, mode: undefined, selectedAcr: undefined });
  renderPage(MfaFactor.TOTP, {
    isStepUp: true,
    availableFactors: [MfaFactor.TOTP, MfaFactor.BackupCode],
  });
  await screen.findByText('mfa.enter_one_time_code');
  expect(
    screen.getByRole('link', { name: 'mfa.try_another_verification_method' }).getAttribute('href')
  ).toBe('/mfa-verification');
});

it.each([
  ['session.step_up.acr_not_satisfied', 'step-up chooser'],
  ['session.step_up.forbidden_route', 'invalid interaction'],
  ['session.interaction_not_found', 'invalid interaction'],
] as const)('handles %s after MFA submission', async (code, destination) => {
  mockedPost.mockReturnValue({
    json: async () => {
      throw new RequestError(code);
    },
  } as unknown as ReturnType<typeof api.post>);
  setContext({ ...context, availableMethods: [VerificationType.BackupCode] });
  const { container } = renderPage(MfaFactor.BackupCode);
  await screen.findByText('mfa.enter_a_backup_code');
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'backup-123' } });
  fireEvent.submit(container.querySelector('form')!);
  await screen.findByText(destination);
  const handlers = mockHandleError.mock.calls[0]?.[1];
  expect(handlers).not.toHaveProperty('user.missing_mfa');
  expect(handlers).not.toHaveProperty('user.missing_profile');
  expect(handlers).not.toHaveProperty('session.trusted_device_suggest_opt_in');
});

it('keeps the latest resent code ID across a state-less refresh without sending again', async () => {
  setContext({ ...context, availableMethods: [VerificationType.MfaEmailVerificationCode] });
  const { unmount } = renderPage(MfaFactor.EmailVerificationCode);
  await screen.findByText('mfa.enter_email_verification_code');
  mockedPost.mockReturnValueOnce({
    json: async () => ({ verificationId: 'resent-code-id' }),
  } as unknown as ReturnType<typeof api.post>);
  fireEvent.click(screen.getByText('Resend code'));
  await waitFor(() => {
    expect(sessionStorage.getItem(`logto:${window.location.origin}:verification-ids`)).toContain(
      'resent-code-id'
    );
  });
  unmount();
  mockedPost.mockClear();
  const { container } = renderPage(MfaFactor.EmailVerificationCode);
  await screen.findByText('mfa.enter_email_verification_code');
  expect(mockedPost).not.toHaveBeenCalled();
  fireEvent.input(container.querySelector('input')!, { target: { value: '384729' } });
  await waitFor(() => {
    expect(mockedPost).toHaveBeenCalledWith(
      '/api/experience/verification/mfa-verification-code/verify',
      {
        json: { verificationId: 'resent-code-id', code: '384729', identifierType: 'email' },
      }
    );
  });
});

it('accepts step-up WebAuthn route state without regenerating the challenge', async () => {
  sessionStorage.setItem(
    `logto:${window.location.origin}:verification-ids`,
    JSON.stringify({ WebAuthn: 'saved-id' })
  );
  setContext({
    ...context,
    availableMethods: [VerificationType.WebAuthn, VerificationType.Password],
  });
  renderPage(MfaFactor.WebAuthn, {
    isStepUp: true,
    availableFactors: [MfaFactor.WebAuthn],
    options: authenticationOptions,
  });
  await screen.findByText('mfa.verify_via_passkey');
  expect(mockedPost).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'action.verify_via_passkey' }));
  await waitFor(() => {
    expect(startAuthentication).toHaveBeenCalledWith(authenticationOptions);
  });
  expect(startRegistration).not.toHaveBeenCalled();
});

it.each([true, false])('scopes resend error navigation to pure step-up (%s)', async (isStepUp) => {
  sessionStorage.setItem(
    `logto:${window.location.origin}:verification-ids`,
    JSON.stringify({ EmailVerificationCode: 'saved-code' })
  );
  setContext({ ...context, availableMethods: [VerificationType.MfaEmailVerificationCode] });
  renderPage(MfaFactor.EmailVerificationCode, {
    isStepUp,
    availableFactors: [MfaFactor.EmailVerificationCode],
  });
  await screen.findByText('mfa.enter_email_verification_code');
  mockedPost.mockReturnValueOnce({
    json: async () => {
      throw new RequestError('session.interaction_not_found');
    },
  } as unknown as ReturnType<typeof api.post>);
  fireEvent.click(screen.getByText('Resend code'));
  await waitFor(() => {
    expect(mockHandleError).toHaveBeenCalledTimes(1);
  });
  if (isStepUp) {
    await screen.findByText('invalid interaction');
  } else {
    expect(mockHandleError.mock.calls[0]?.[1]).toBeUndefined();
    expect(screen.getByText('mfa.enter_email_verification_code')).not.toBeNull();
  }
});

it('offers a deliberate retry when recovering a challenge fails', async () => {
  setContext({
    ...context,
    availableMethods: [VerificationType.WebAuthn, VerificationType.Password],
  });
  mockedPost.mockReturnValueOnce({
    json: async () => {
      throw new Error('network');
    },
  } as unknown as ReturnType<typeof api.post>);
  renderPage(MfaFactor.WebAuthn);
  await screen.findByText('mfa.webauthn');
  expect(mockedPost).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByText('mfa.webauthn'));
  await screen.findByText('mfa.verify_via_passkey');
  expect(mockedPost).toHaveBeenCalledTimes(2);
});
