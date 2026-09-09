import {
  AuthenticationContextMode,
  FirstScreen,
  LogtoAcr,
  demoAppApplicationId,
} from '@logto/schemas';

import { buildLoginPromptUrl } from './utils.js';

describe('buildLoginPromptUrl with login prompt details', () => {
  const stepUpDetails = {
    max_age: '600',
    authenticationContext: {
      requestedAcrValues: [LogtoAcr.Mfa],
      selectedAcr: LogtoAcr.Mfa,
      mode: AuthenticationContextMode.StepUp,
    },
  };

  it('should route a step-up prompt to the step-up path with only the shared params', () => {
    expect(buildLoginPromptUrl({}, undefined, stepUpDetails)).toBe('step-up');
    expect(
      buildLoginPromptUrl(
        {},
        { appId: 'app_123', organizationId: 'org_123', uiLocales: 'fr-CA fr' },
        stepUpDetails
      )
    ).toBe('step-up?app_id=app_123&organization_id=org_123&ui_locales=fr-CA+fr');
  });

  it('should ignore first screen, direct sign-in, and identifier hints for a step-up prompt', () => {
    // The subject is pinned from the session, so no first screen applies.
    expect(
      buildLoginPromptUrl(
        {
          first_screen: FirstScreen.Register,
          direct_sign_in: 'method:target',
          login_hint: 'user@mail.com',
          one_time_token: 'token_value',
        },
        { appId: demoAppApplicationId },
        stepUpDetails
      )
    ).toBe('step-up?app_id=demo-app');
  });

  it('should keep the sign-in url for a prompt that carries only the requested values', () => {
    // A sign-in without a session never enters step-up mode.
    const details = {
      authenticationContext: { requestedAcrValues: [LogtoAcr.Mfa] },
    };

    expect(buildLoginPromptUrl({}, { appId: 'app_123' }, details)).toBe('sign-in?app_id=app_123');
    expect(buildLoginPromptUrl({ first_screen: FirstScreen.Register }, undefined, details)).toBe(
      'register'
    );
  });

  it.each([
    { requestedAcrValues: [LogtoAcr.Mfa] },
    { requestedAcrValues: [LogtoAcr.Mfa], selectedAcr: LogtoAcr.FirstFactor },
    { requestedAcrValues: [], selectedAcr: LogtoAcr.Mfa },
  ])('should keep the sign-in url for an invalid step-up selection: %j', (context) => {
    expect(
      buildLoginPromptUrl(
        {},
        { appId: 'app_123' },
        { authenticationContext: { ...context, mode: AuthenticationContextMode.StepUp } }
      )
    ).toBe('sign-in?app_id=app_123');
  });

  it('should keep the sign-in url for prompts without an authentication context', () => {
    expect(buildLoginPromptUrl({}, { appId: 'app_123' }, { max_age: '600' })).toBe(
      'sign-in?app_id=app_123'
    );
    expect(buildLoginPromptUrl({}, undefined, { authenticationContext: 'stepUp' })).toBe('sign-in');
  });
});
