import { stepUpRoutes } from '@/constants/step-up';
import useStepUpContext from '@/hooks/use-step-up-context';
import SwitchIcon from '@/shared/assets/icons/switch-icon.svg?react';
import { UserMfaFlow } from '@/types';
import { type MfaFlowState } from '@/types/guard';
import { hasAlternativeStepUpMethod } from '@/utils/step-up';

import TextLink from '../TextLink';

type Props = {
  readonly flow: UserMfaFlow;
  readonly flowState: MfaFlowState;
  readonly className?: string;
};

const SwitchMfaFactorsLink = ({ flow, flowState, className }: Props) => {
  const { availableFactors } = flowState;
  const { authenticationContext, isPureStepUp } = useStepUpContext();
  const isStepUpVerification = isPureStepUp && flow === UserMfaFlow.MfaVerification;
  const hasAlternativeMethod = isStepUpVerification
    ? hasAlternativeStepUpMethod(authenticationContext?.availableMethods ?? [])
    : availableFactors.length >= 2;

  if (!hasAlternativeMethod) {
    return null;
  }

  return (
    <TextLink
      to={isStepUpVerification ? stepUpRoutes.landing : `/${flow}`}
      text={
        flow === UserMfaFlow.MfaBinding
          ? 'mfa.link_another_mfa_factor'
          : 'mfa.try_another_verification_method'
      }
      className={className}
      icon={<SwitchIcon />}
      state={isPureStepUp ? undefined : flowState}
    />
  );
};

export default SwitchMfaFactorsLink;
