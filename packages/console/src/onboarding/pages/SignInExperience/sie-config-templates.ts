import { SignInIdentifier } from '@logto/schemas';

import type { OnboardingSieConfig } from '@/onboarding/types';
import { Authentication } from '@/onboarding/types';

const assetsUrl =
  'https://logtodev.blob.core.windows.net/public-blobs/admin/BY4BCq8GvfBF/2023/03/10';

export const defaultOnboardingSieConfig: OnboardingSieConfig = {
  color: '#5D34F2',
  identifier: SignInIdentifier.Email,
  authentications: [Authentication.Password],
};

// Email + password sign-up; password sign-in
const configTemplate1: OnboardingSieConfig = {
  logo: `${assetsUrl}/tVCAHjAB/logo1.png`,
  color: '#19BEFD',
  identifier: SignInIdentifier.Email,
  authentications: [Authentication.Password],
};

// Email + password sign-up; password + code sign-in
const configTemplate2: OnboardingSieConfig = {
  logo: `${assetsUrl}/IcI0snBP/logo3.png`,
  color: '#FF5449',
  identifier: SignInIdentifier.Email,
  authentications: [Authentication.Password, Authentication.VerificationCode],
};

// Email + code sign-up; code sign-in
const configTemplate3: OnboardingSieConfig = {
  logo: `${assetsUrl}/7UQyvuFc/logo4.png`,
  color: '#CA4E96',
  identifier: SignInIdentifier.Email,
  authentications: [Authentication.VerificationCode],
};

// Username sign-up; password sign-in
const configTemplate4: OnboardingSieConfig = {
  logo: `${assetsUrl}/uLoMzrlz/logo7.png`,
  color: '#FF5449',
  identifier: SignInIdentifier.Username,
  authentications: [Authentication.Password],
};

const sieConfigTemplates: OnboardingSieConfig[] = [
  configTemplate1,
  configTemplate2,
  configTemplate3,
  configTemplate4,
];

export const randomSieConfigTemplate = (
  lastTemplateIndex: number | undefined,
  availableSocialTargets: string[]
) => {
  // Get random template
  const randomIndex = Math.floor(Math.random() * sieConfigTemplates.length);
  const index =
    randomIndex === lastTemplateIndex ? (randomIndex + 1) % sieConfigTemplates.length : randomIndex;
  const template = sieConfigTemplates[index] ?? configTemplate1;

  // Get 2 or 3 random social targets
  const randomCount = Math.floor(Math.random() * 2) + 2;

  // Take the first randomCount after shuffling.
  const socialTargets = availableSocialTargets
    .slice()
    .sort(() => 0.5 - Math.random())
    .slice(0, randomCount);

  return {
    template: {
      ...template,
      socialTargets,
    },
    templateIndex: index,
  };
};
