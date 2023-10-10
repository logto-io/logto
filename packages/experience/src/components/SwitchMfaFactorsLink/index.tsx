import { type MfaFactor } from '@logto/schemas';

import SwitchIcon from '@/assets/icons/switch-icon.svg';
import { UserMfaFlow } from '@/types';
import { type MfaFactorsState } from '@/types/guard';

import TextLink from '../TextLink';

type Props = {
  flow: UserMfaFlow;
  factors: MfaFactor[];
  className?: string;
};

const SwitchMfaFactorsLink = ({ flow, factors, className }: Props) => (
  <TextLink
    to={`/${flow}`}
    text={
      flow === UserMfaFlow.MfaBinding
        ? 'mfa.link_another_mfa_factor'
        : 'mfa.try_another_verification_method'
    }
    className={className}
    icon={<SwitchIcon />}
    state={{ availableFactors: factors } satisfies MfaFactorsState}
  />
);

export default SwitchMfaFactorsLink;
