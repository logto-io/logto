import { AuthenticationContextMode } from '@logto/schemas';

import { stepUpRoutes } from '@/constants/step-up';
import useStepUpContext from '@/hooks/use-step-up-context';
import SwitchIcon from '@/shared/assets/icons/switch-icon.svg?react';
import { UserMfaFlow } from '@/types';
import { type MfaFlowState } from '@/types/guard';
import { getDisplayedStepUpMethods } from '@/utils/step-up';

import TextLink from '../TextLink';

type Props = {
  readonly flow: UserMfaFlow;
  readonly flowState: MfaFlowState;
  readonly className?: string;
};

const SwitchMfaFactorsLink = ({ flow, flowState, className }: Props) => {
  const { availableFactors } = flowState;
  const { authenticationContext } = useStepUpContext();
  const isStepUp = authenticationContext?.mode === AuthenticationContextMode.StepUp;
  const methodCount = isStepUp
    ? getDisplayedStepUpMethods(authenticationContext.availableMethods).length
    : availableFactors.length;

  if (methodCount < 2) {
    return null;
  }

  return (
    <TextLink
      to={isStepUp ? stepUpRoutes.landing : `/${flow}`}
      text={
        flow === UserMfaFlow.MfaBinding
          ? 'mfa.link_another_mfa_factor'
          : 'mfa.try_another_verification_method'
      }
      className={className}
      icon={<SwitchIcon />}
      state={isStepUp ? undefined : flowState}
    />
  );
};

export default SwitchMfaFactorsLink;
