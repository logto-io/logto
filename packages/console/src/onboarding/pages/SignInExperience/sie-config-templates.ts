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

const configTemplate1: OnboardingSieConfig = {
  logo: `${assetsUrl}/tVCAHjAB/logo1.png`,
  color: '#19BEFD',
  identifier: SignInIdentifier.Email,
  authentications: [Authentication.Password, Authentication.VerificationCode],
};

const configTemplate2: OnboardingSieConfig = {
  logo: `${assetsUrl}/kvCN1Z2a/logo2.png`,
  color: '#F47346',
  identifier: SignInIdentifier.Phone,
  authentications: [Authentication.Password, Authentication.VerificationCode],
};

const configTemplate3: OnboardingSieConfig = {
  logo: `${assetsUrl}/IcI0snBP/logo3.png`,
  color: '#FF5449',
  identifier: SignInIdentifier.Username,
  authentications: [Authentication.Password],
};

const configTemplate4: OnboardingSieConfig = {
  logo: `${assetsUrl}/7UQyvuFc/logo4.png`,
  color: '#CA4E96',
  identifier: SignInIdentifier.Email,
  authentications: [Authentication.Password],
};

const configTemplate5: OnboardingSieConfig = {
  logo: `${assetsUrl}/zB2merH1/logo5.png`,
  color: '#F07EFF',
  identifier: SignInIdentifier.Email,
  authentications: [Authentication.VerificationCode],
};

const configTemplate6: OnboardingSieConfig = {
  logo: `${assetsUrl}/CX51jxXS/logo6.png`,
  color: '#9E65F8',
  identifier: SignInIdentifier.Phone,
  authentications: [Authentication.VerificationCode],
};

const configTemplate7: OnboardingSieConfig = {
  logo: `${assetsUrl}/uLoMzrlz/logo7.png`,
  color: '#FF5449',
  identifier: SignInIdentifier.Email,
  authentications: [Authentication.Password, Authentication.VerificationCode],
};

const configTemplate8: OnboardingSieConfig = {
  logo: `${assetsUrl}/dIz8UHEh/logo8.png`,
  color: '#5D34F2',
  identifier: SignInIdentifier.Phone,
  authentications: [Authentication.VerificationCode],
};

const sieConfigTemplates: OnboardingSieConfig[] = [
  configTemplate1,
  configTemplate2,
  configTemplate3,
  configTemplate4,
  configTemplate5,
  configTemplate6,
  configTemplate7,
  configTemplate8,
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
