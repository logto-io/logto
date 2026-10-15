/* eslint-disable @typescript-eslint/promise-function-async -- Ky mocks must retain their synchronous .json() accessor, which async would strip. */
import {
  AuthenticationContextMode,
  type InteractionAuthenticationContext,
  InteractionEvent,
  LogtoAcr,
  MfaFactor,
  MissingProfile,
  VerificationType,
} from '@logto/schemas';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { fireEvent, renderHook, screen, waitFor } from '@testing-library/react';
import { HTTPError, type ResponsePromise } from 'ky';
import { Route, Routes } from 'react-router-dom';

import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import {
  mockSignInExperienceSettings,
  mockSsoConnectors,
  socialConnectors,
} from '@/__mocks__/logto';
import api from '@/apis/api';
import StepUpGuard from '@/containers/StepUpGuard';
import useSessionStorage, { StorageKeys } from '@/hooks/use-session-storages';
import Continue from '@/pages/Continue';
import MfaBinding from '@/pages/MfaBinding';
import TotpBinding from '@/pages/MfaBinding/TotpBinding';
import WebAuthnBinding from '@/pages/MfaBinding/WebAuthnBinding';
import MfaOnboarding from '@/pages/MfaOnboarding';
import SocialCallback from '@/pages/SocialSignInWebCallback';
import StepUp from '@/pages/StepUp';
import { UserMfaFlow } from '@/types';
import { storeState } from '@/utils/social-connectors';

import StepUpRecoveryGuard from '.';

const mockRedirect = jest.fn();

jest.mock('@/apis/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));
jest.mock('@/hooks/use-global-redirect-to', () => ({
  __esModule: true,
  default: () => mockRedirect,
}));
jest.mock('@simplewebauthn/browser', () => ({
  browserSupportsWebAuthn: () => true,
  startAuthentication: jest.fn(),
  startRegistration: jest.fn(),
}));

const context: InteractionAuthenticationContext = {
  mode: AuthenticationContextMode.StepUp,
  requestedAcrValues: [LogtoAcr.FirstFactor],
  selectedAcr: LogtoAcr.FirstFactor,
  availableMethods: [],
  establishableMethods: [],
  enrollableFactors: [],
  subjectProofConnectors: [],
  maskedIdentifiers: {},
};

const response = (value: unknown) => ({ json: async () => value }) as unknown as ResponsePromise;

const setContext = (value?: InteractionAuthenticationContext) => {
  jest.mocked(api.get).mockReturnValue(response({ authenticationContext: value }));
};

const renderPage = (path: string, state?: unknown) =>
  renderWithPageContext(
    <SettingsProvider
      settings={{ ...mockSignInExperienceSettings, ssoConnectors: mockSsoConnectors }}
    >
      <UserInteractionContextProvider>
        <Routes>
          <Route element={<StepUpRecoveryGuard />}>
            <Route path="/callback/social/:connectorId" element={<SocialCallback />} />
            <Route path=":flow/verification-code" element={<div>Code form</div>} />
            <Route path="/continue/:method?" element={<Continue />} />
            <Route path="/mfa-onboarding" element={<MfaOnboarding />} />
            <Route path="/mfa-binding" element={<MfaBinding />} />
            <Route path={`/mfa-binding/${MfaFactor.TOTP}`} element={<TotpBinding />} />
            <Route path={`/mfa-binding/${MfaFactor.WebAuthn}`} element={<WebAuthnBinding />} />
          </Route>
          <Route path="/step-up" element={<StepUpGuard />}>
            <Route index element={<StepUp />} />
          </Route>
          <Route path="/unknown-session" element={<div>Invalid session</div>} />
          <Route path="/sign-in" element={<div>Sign in</div>} />
          <Route path="/social/link/:connectorId" element={<div>Link account</div>} />
        </Routes>
      </UserInteractionContextProvider>
    </SettingsProvider>,
    {
      initialEntries: [
        {
          pathname: new URL(path, 'https://logto.test').pathname,
          search: new URL(path, 'https://logto.test').search,
          state,
        },
      ],
    }
  );

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
  localStorage.clear();
  setContext(context);
  jest.mocked(api.post).mockImplementation(() => response({ verificationId: 'proof' }));
});

it.each(['/continue', '/continue/password'])(
  'recovers %s and submits the established password',
  async (path) => {
    setContext({ ...context, establishableMethods: [MissingProfile.password] });
    jest
      .mocked(api.post)
      .mockImplementation(() => response({ redirectTo: 'https://client.example/callback' }));
    const { container } = renderPage(path);
    await screen.findByText('description.set_password');
    fireEvent.change(container.querySelector('input[name="newPassword"]')!, {
      target: { value: 'New-password-42!' },
    });
    fireEvent.click(screen.getByText('action.save_password'));
    await waitFor(() => {
      expect(mockRedirect).toHaveBeenCalledWith('https://client.example/callback');
    });
    expect(api.post).toHaveBeenCalledWith('/api/experience/profile', {
      json: { type: 'password', value: 'New-password-42!' },
    });
    expect(api.post).not.toHaveBeenCalledWith('/api/experience/identification', expect.anything());
    expect(api.put).not.toHaveBeenCalled();
  }
);

it.each([
  ['/continue/email', MissingProfile.email, 'description.link_email'],
  ['/continue/phone', MissingProfile.phone, 'description.link_phone'],
] as const)('recovers %s without registration state', async (path, method, title) => {
  setContext({ ...context, establishableMethods: [method] });
  renderPage(path, { interactionEvent: InteractionEvent.Register, isStepUp: true });
  expect(await screen.findByText(title)).not.toBeNull();
  expect(screen.queryByText('action.create_account')).toBeNull();
});

it.each([
  '/mfa-binding',
  '/mfa-onboarding',
  `/mfa-binding/${MfaFactor.TOTP}`,
  `/mfa-binding/${MfaFactor.WebAuthn}`,
])(
  'recovers %s from enrollable factors, never verification methods or skip hints',
  async (path) => {
    setContext({
      ...context,
      availableMethods: [VerificationType.Password],
      enrollableFactors: [MfaFactor.TOTP],
    });
    renderPage(path);
    expect(await screen.findByText('mfa.add_mfa_factors')).not.toBeNull();
    expect(screen.getByText('mfa.totp')).not.toBeNull();
    expect(screen.queryByText('mfa.webauthn')).toBeNull();
    expect(screen.queryByText('action.skip')).toBeNull();
    expect(api.put).not.toHaveBeenCalled();
  }
);

it('uses the enrollment list after an insufficient password establishment submission', async () => {
  setContext({ ...context, establishableMethods: [MissingProfile.password] });
  jest.mocked(api.post).mockImplementation((path) => {
    if (path === '/api/experience/submit') {
      setContext({ ...context, selectedAcr: LogtoAcr.Mfa, enrollableFactors: [MfaFactor.TOTP] });
      throw new HTTPError(
        {
          json: async () => ({
            code: 'session.step_up.acr_not_satisfied',
            message: 'More proof required',
          }),
        } as Response,
        {} as Request,
        {} as never
      );
    }
    return response({});
  });
  const { container } = renderPage('/continue/password');
  await screen.findByText('description.set_password');
  fireEvent.change(container.querySelector('input[name="newPassword"]')!, {
    target: { value: 'New-password-42!' },
  });
  fireEvent.click(screen.getByText('action.save_password'));
  expect(await screen.findByText('mfa.add_mfa_factors')).not.toBeNull();
  expect(api.put).not.toHaveBeenCalled();
});

it.each([
  ['social', socialConnectors[0]!.id, VerificationType.Social],
  ['sso', mockSsoConnectors[0]!.id, VerificationType.EnterpriseSso],
] as const)(
  'forwards a %s subject proof to establishment, not sign-in',
  async (type, connectorId, verificationType) => {
    storeState('callback-state', connectorId);
    const { result } = renderHook(() => useSessionStorage());
    result.current.set(StorageKeys.verificationIds, { [verificationType]: 'proof' });
    jest.mocked(api.post).mockImplementation((path) => {
      if (path === '/api/experience/identification') {
        setContext({ ...context, establishableMethods: [MissingProfile.password] });
      }
      return response({ verificationId: 'proof' });
    });
    renderPage(`/callback/social/${connectorId}?state=callback-state&code=upstream-code`);
    expect(await screen.findByText('description.set_password')).not.toBeNull();
    expect(api.post).toHaveBeenCalledWith(
      `/api/experience/verification/${type}/${connectorId}/verify`,
      expect.anything()
    );
    expect(api.post).toHaveBeenCalledWith('/api/experience/identification', {
      json: { verificationId: 'proof' },
    });
    expect(api.post).not.toHaveBeenCalledWith('/api/experience/submit');
    expect(api.put).not.toHaveBeenCalled();
  }
);

it.each([
  [socialConnectors[0]!.id, VerificationType.Social],
  [mockSsoConnectors[0]!.id, VerificationType.EnterpriseSso],
] as const)(
  'rejects a mismatched subject from %s without registering or linking',
  async (connectorId, verificationType) => {
    storeState('callback-state', connectorId);
    const { result } = renderHook(() => useSessionStorage());
    result.current.set(StorageKeys.verificationIds, { [verificationType]: 'proof' });
    jest.mocked(api.post).mockImplementation((path) => {
      if (path === '/api/experience/identification') {
        throw new HTTPError(
          {
            json: async () => ({ code: 'session.identity_conflict', message: 'Wrong subject' }),
          } as Response,
          {} as Request,
          {} as never
        );
      }
      return response({ verificationId: 'proof' });
    });
    renderPage(`/callback/social/${connectorId}?state=callback-state&code=upstream-code`);
    expect(await screen.findByText('Invalid session')).not.toBeNull();
    expect(screen.queryByText('Sign in')).toBeNull();
    expect(screen.queryByText('Link account')).toBeNull();
    expect(api.put).not.toHaveBeenCalled();
  }
);

it.each([InteractionEvent.SignIn, InteractionEvent.Register])(
  'keeps ordinary %s profile completion independent of context recovery',
  async (interactionEvent) => {
    jest.mocked(api.get).mockImplementation(() => {
      throw new Error('Context unavailable');
    });
    jest
      .mocked(api.post)
      .mockImplementation(() => response({ redirectTo: 'https://client.example/callback' }));
    const { container } = renderPage('/continue/password', {
      interactionEvent,
    });
    await screen.findByText('description.set_password');
    fireEvent.change(container.querySelector('input[name="newPassword"]')!, {
      target: { value: 'New-password-42!' },
    });
    fireEvent.click(screen.getByText('action.save_password'));
    await waitFor(() => {
      expect(mockRedirect).toHaveBeenCalledWith('https://client.example/callback');
    });
    expect(api.get).not.toHaveBeenCalled();
    if (interactionEvent === InteractionEvent.Register) {
      expect(api.post).toHaveBeenCalledWith('/api/experience/identification', { json: {} });
    } else {
      expect(api.post).not.toHaveBeenCalledWith(
        '/api/experience/identification',
        expect.anything()
      );
    }
  }
);

it.each([
  '/sign-in/verification-code',
  '/register/verification-code',
  '/forgot-password/verification-code',
])('renders %s without waiting for context recovery', (path) => {
  jest.mocked(api.get).mockImplementation(() => {
    throw new Error('Context unavailable');
  });
  renderPage(path);
  expect(screen.getByText('Code form')).not.toBeNull();
  expect(api.get).not.toHaveBeenCalled();
});

it.each([
  ['/mfa-binding', { availableFactors: [MfaFactor.TOTP], skippable: true }, 'mfa.add_mfa_factors'],
  ['/continue/verification-code', { interactionEvent: InteractionEvent.Register }, 'Code form'],
  [
    '/continue/verification-code',
    {
      flow: UserMfaFlow.MfaBinding,
      mfaFlowState: { availableFactors: [MfaFactor.EmailVerificationCode] },
    },
    'Code form',
  ],
] as const)('keeps ordinary %s route state without context recovery', (path, state, title) => {
  jest.mocked(api.get).mockImplementation(() => {
    throw new Error('Context unavailable');
  });
  renderPage(path, state);
  expect(screen.getByText(title)).not.toBeNull();
  expect(api.get).not.toHaveBeenCalled();
});

it.each([
  ['social', socialConnectors[0]!.id],
  ['sso', mockSsoConnectors[0]!.id],
] as const)(
  'starts %s subject proof without resetting the interaction',
  async (type, connectorId) => {
    setContext({ ...context, subjectProofConnectors: [{ type, connectorId }] });
    jest.mocked(api.post).mockImplementation(() =>
      response({
        verificationId: 'proof',
        authorizationUri: 'https://provider.example/authorize',
      })
    );
    renderPage('/step-up');
    fireEvent.click(await screen.findByText('action.sign_in_with'));
    await waitFor(() => {
      expect(mockRedirect).toHaveBeenCalledWith('https://provider.example/authorize');
    });
    expect(api.post).toHaveBeenCalledWith(
      `/api/experience/verification/${type}/${connectorId}/authorization-uri`,
      expect.anything()
    );
    expect(api.put).not.toHaveBeenCalled();
  }
);

it('binds TOTP and submits directly after recovery, with a way to choose another enrollable factor', async () => {
  setContext({ ...context, enrollableFactors: [MfaFactor.TOTP, MfaFactor.WebAuthn] });
  jest.mocked(api.post).mockImplementation((path) =>
    response(
      path === '/api/experience/verification/totp/secret'
        ? {
            verificationId: 'totp-record',
            secret: 'totp-secret',
            secretQrCode: 'data:image/png;base64,qr',
          }
        : { redirectTo: 'https://client.example/callback' }
    )
  );
  const { container } = renderPage('/mfa-binding');
  fireEvent.click(await screen.findByText('mfa.totp'));
  expect(await screen.findByText('mfa.add_authenticator_app')).not.toBeNull();
  expect(screen.getByText('mfa.link_another_mfa_factor').closest('a')?.getAttribute('href')).toBe(
    '/mfa-binding'
  );
  expect(screen.queryByText('action.skip')).toBeNull();
  const input = container.querySelector('input[name="totpCode_0"]');
  expect(input).not.toBeNull();
  fireEvent.input(input!, { target: { value: '123456' } });
  await waitFor(() => {
    expect(mockRedirect).toHaveBeenCalledWith('https://client.example/callback');
  });
  expect(api.post).toHaveBeenCalledWith('/api/experience/profile/mfa', {
    json: { type: MfaFactor.TOTP, verificationId: 'totp-record' },
  });
  expect(api.post).not.toHaveBeenCalledWith('/api/experience/identification', expect.anything());
  expect(api.put).not.toHaveBeenCalled();
});

it('enrolls a passkey in step-up rather than authenticating with an existing credential', async () => {
  setContext({ ...context, enrollableFactors: [MfaFactor.WebAuthn] });
  const registrationOptions = {
    rp: { name: 'Logto' },
    user: { id: 'pinned-user', name: 'User', displayName: 'User' },
    challenge: 'registration-challenge',
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
  };
  jest
    .mocked(api.post)
    .mockImplementation((path) =>
      response(
        path === '/api/experience/verification/web-authn/registration'
          ? { verificationId: 'registration', registrationOptions }
          : { redirectTo: 'https://client.example/callback' }
      )
    );
  jest.mocked(startRegistration).mockResolvedValue({
    id: 'credential',
    rawId: 'credential',
    response: { clientDataJSON: 'client-data', attestationObject: 'attestation' },
    clientExtensionResults: {},
    type: 'public-key',
  });
  renderPage('/mfa-binding');
  fireEvent.click(await screen.findByText('mfa.webauthn'));
  fireEvent.click(await screen.findByRole('button', { name: 'mfa.create_a_passkey' }));
  await waitFor(() => {
    expect(mockRedirect).toHaveBeenCalledWith('https://client.example/callback');
  });
  expect(startRegistration).toHaveBeenCalledWith(registrationOptions);
  expect(startAuthentication).not.toHaveBeenCalled();
  expect(api.post).toHaveBeenCalledWith('/api/experience/profile/mfa', {
    json: { type: MfaFactor.WebAuthn, verificationId: 'registration' },
  });
  expect(api.put).not.toHaveBeenCalled();
});
/* eslint-enable @typescript-eslint/promise-function-async */
