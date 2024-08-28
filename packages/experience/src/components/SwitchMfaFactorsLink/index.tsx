import SwitchIcon from '@/assets/icons/switch-icon.svg';
import { UserMfaFlow } from '@/types';
import { type MfaFlowState } from '@/types/guard';

import TextLink from '../TextLink';

type Props = {
  readonly flow: UserMfaFlow;
  readonly flowState: MfaFlowState;
  readonly className?: string;
};

const SwitchMfaFactorsLink = ({ flow, flowState, className }: Props) => {
  const { availableFactors } = flowState;

  if (availableFactors.length < 2) {
    return null;
  }

  return (
    <TextLink
      to={`/${flow}`}
      text={
        flow === UserMfaFlow.MfaBinding
          ? 'mfa.link_another_mfa_factor'
          : 'mfa.try_another_verification_method'
      }
      className={className}
      icon={<SwitchIcon />}
      state={flowState}
    />
  );
};

export default SwitchMfaFactorsLink;
