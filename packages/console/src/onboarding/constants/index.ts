import { SignInIdentifier } from '@logto/schemas';

import type { OnboardingSieConfig } from '../types';
import { Authentication } from '../types';

export const reservationLink = 'https://calendly.com/logto/30min';
export const logtoBlogLink =
  'https://www.notion.so/silverhand/About-Logto-Cloud-Preview-ca316bc05f2a4b9188047da014124434?pvs=4';

export const defaultOnboardingSieConfig: OnboardingSieConfig = {
  color: '#5D34F2',
  identifier: SignInIdentifier.Email,
  authentications: [Authentication.Password],
};
