import { MfaPolicy } from '@logto/schemas';

import { type Props as PolicyOptionTitleProps } from './PolicyOptionTitle';

export const policyOptionTitlePropsMap: Record<MfaPolicy, PolicyOptionTitleProps> = {
  [MfaPolicy.UserControlled]: {
    title: 'mfa.user_controlled',
    description: 'mfa.user_controlled_description',
  },
  [MfaPolicy.Mandatory]: {
    title: 'mfa.mandatory',
    description: 'mfa.mandatory_description',
  },
};
