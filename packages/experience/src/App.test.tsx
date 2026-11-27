import {
  AuthenticationContextMode,
  type InteractionAuthenticationContext,
  LogtoAcr,
  VerificationType,
} from '@logto/schemas';
import { configure, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';

import App from '@/App';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
import { getStepUpContext } from '@/apis/experience';
import { getSignInExperienceSettings } from '@/utils/sign-in-experience';

jest.mock('@/apis/experience');
jest.mock('@/utils/sign-in-experience');
jest.mock('@/i18n/init', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- the mock resolves without doing anything
  default: jest.fn(async () => {}),
}));
// The captcha provider imports a bundled WASM asset that Jest cannot resolve; it is irrelevant to
// the route guard.
jest.mock('@/Providers/CaptchaContextProvider', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => children,
}));

// The first full App render is cold and chains several async steps (settings, entry guard,
// redirect, step-up context) before the page appears, which can exceed the default 1s wait on a
// loaded CI runner.
configure({ asyncUtilTimeout: 5000 });
jest.setTimeout(10_000);

const mockedGetStepUpContext = getStepUpContext as jest.MockedFunction<typeof getStepUpContext>;
const mockedGetSettings = getSignInExperienceSettings as jest.MockedFunction<
  typeof getSignInExperienceSettings
>;

const stepUpContext: InteractionAuthenticationContext = {
  requestedAcrValues: [LogtoAcr.FirstFactor],
  selectedAcr: LogtoAcr.FirstFactor,
  mode: AuthenticationContextMode.StepUp,
  // Offer two methods so `/step-up` renders the chooser instead of auto-forwarding to the single
  // method before the route assertion observes the landing path.
  availableMethods: [VerificationType.Password, VerificationType.EmailVerificationCode],
  establishableMethods: [],
  enrollableFactors: [],
  subjectProofConnectors: [],
  maskedIdentifiers: { email: 'f***@example.com' },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedGetSettings.mockResolvedValue(mockSignInExperienceSettings);
  window.history.pushState({}, '', '/sign-in');
});

it.each(['/sign-in', '/register'])(
  'sends the real %s route back to the step-up landing in pure step-up',
  async (path) => {
    window.history.pushState({}, '', path);
    mockedGetStepUpContext.mockResolvedValue(stepUpContext);

    render(<App />);

    expect(await screen.findByText('step_up.choose_method_description')).not.toBeNull();
    expect(window.location.pathname).toBe('/step-up');
    expect(screen.queryByText('description.sign_in_to_your_account')).toBeNull();
  }
);

it('keeps the real sign-in route without a step-up interaction', async () => {
  mockedGetStepUpContext.mockRejectedValue(new Error('no interaction'));

  render(<App />);

  expect(await screen.findByText('description.sign_in_to_your_account')).not.toBeNull();
  expect(screen.queryByText('error.invalid_session')).toBeNull();
});
