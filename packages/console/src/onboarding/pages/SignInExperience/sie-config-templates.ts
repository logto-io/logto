import { SignInIdentifier } from '@logto/schemas';

import type { OnboardingSieFormData } from './types';
import { Authentication } from './types';

const assetsUrl =
  'https://logtodev.blob.core.windows.net/public-blobs/admin/BY4BCq8GvfBF/2023/03/10';

export const defaultOnboardingSieFormData: OnboardingSieFormData = {
  color: '#5D34F2',
  identifier: SignInIdentifier.Email,
  authentications: [Authentication.Password],
};

// Email + password sign-up; password sign-in
const formDataTemplate1: OnboardingSieFormData = {
  logo: `${assetsUrl}/tVCAHjAB/logo1.png`,
  color: '#19BEFD',
  identifier: SignInIdentifier.Email,
  authentications: [Authentication.Password],
};

// Email + password sign-up; password + code sign-in
const formDataTemplate2: OnboardingSieFormData = {
  logo: `${assetsUrl}/IcI0snBP/logo3.png`,
  color: '#FF5449',
  identifier: SignInIdentifier.Email,
  authentications: [Authentication.Password, Authentication.VerificationCode],
};

// Email + code sign-up; code sign-in
const formDataTemplate3: OnboardingSieFormData = {
  logo: `${assetsUrl}/7UQyvuFc/logo4.png`,
  color: '#CA4E96',
  identifier: SignInIdentifier.Email,
  authentications: [Authentication.VerificationCode],
};

// Username sign-up; password sign-in
const formDataTemplate4: OnboardingSieFormData = {
  logo: `${assetsUrl}/uLoMzrlz/logo7.png`,
  color: '#FF5449',
  identifier: SignInIdentifier.Username,
  authentications: [Authentication.Password],
};

const formDataTemplates: OnboardingSieFormData[] = [
  formDataTemplate1,
  formDataTemplate2,
  formDataTemplate3,
  formDataTemplate4,
];

export const randomSieFormDataTemplate = (
  lastTemplateIndex: number | undefined,
  availableSocialTargets: string[]
) => {
  // Get random template
  const randomIndex = Math.floor(Math.random() * formDataTemplates.length);
  const index =
    randomIndex === lastTemplateIndex ? (randomIndex + 1) % formDataTemplates.length : randomIndex;
  const template = formDataTemplates[index] ?? formDataTemplate1;

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
