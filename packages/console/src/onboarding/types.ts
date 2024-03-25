export enum OnboardingRoute {
  Onboarding = 'onboarding',
}

export enum OnboardingPage {
  Welcome = 'welcome',
  /** @deprecated Merged `about-user` to `welcome` page. */
  AboutUser = 'about-user',
  SignInExperience = 'sign-in-experience',
  /** @deprecated Remove this to shorten onboarding process. */
  Congrats = 'congrats',
}
