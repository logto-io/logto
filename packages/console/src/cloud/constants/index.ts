import { SignInIdentifier } from '@logto/schemas';

import type { OnboardingSieConfig } from '../types';
import { Authentication } from '../types';

export const reservationLink = 'https://calendly.com/logto/30min';

export const defaultOnboardingSieConfig: OnboardingSieConfig = {
  color: '#5D34F2',
  identifier: SignInIdentifier.Email,
  authentications: [Authentication.Password],
};
