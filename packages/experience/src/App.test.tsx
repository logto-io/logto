import {
  AuthenticationContextMode,
  type InteractionAuthenticationContext,
  LogtoAcr,
  VerificationType,
} from '@logto/schemas';
import { render, screen } from '@testing-library/react';
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

const mockedGetStepUpContext = getStepUpContext as jest.MockedFunction<typeof getStepUpContext>;
const mockedGetSettings = getSignInExperienceSettings as jest.MockedFunction<
  typeof getSignInExperienceSettings
>;

const stepUpContext: InteractionAuthenticationContext = {
  requestedAcrValues: [LogtoAcr.FirstFactor],
  selectedAcr: LogtoAcr.FirstFactor,
  mode: AuthenticationContextMode.StepUp,
  availableMethods: [VerificationType.Password],
  establishableMethods: [],
  enrollableFactors: [],
  subjectProofConnectors: [],
  maskedIdentifiers: {},
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedGetSettings.mockResolvedValue(mockSignInExperienceSettings);
  window.history.pushState({}, '', '/sign-in');
});

it.each(['/sign-in', '/register'])('blocks the real %s route in pure step-up', async (path) => {
  window.history.pushState({}, '', path);
  mockedGetStepUpContext.mockResolvedValue(stepUpContext);

  render(<App />);

  expect(await screen.findByText('error.invalid_session')).not.toBeNull();
  expect(screen.queryByText('description.sign_in_to_your_account')).toBeNull();
});

it('keeps the real sign-in route without a step-up interaction', async () => {
  mockedGetStepUpContext.mockRejectedValue(new Error('no interaction'));

  render(<App />);

  expect(await screen.findByText('description.sign_in_to_your_account')).not.toBeNull();
  expect(screen.queryByText('error.invalid_session')).toBeNull();
});
