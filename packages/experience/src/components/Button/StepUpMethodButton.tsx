import { MfaFactor, VerificationType } from '@logto/schemas';
import classNames from 'classnames';

import LockIcon from '@/assets/icons/lock.svg?react';
import ArrowNext from '@/shared/assets/icons/arrow-next.svg?react';
import styles from '@/shared/components/Button/index.module.scss';
import DynamicT from '@/shared/components/DynamicT';
import FlipOnRtl from '@/shared/components/FlipOnRtl';
import { type StepUpMethod, stepUpMethodToMfaFactor } from '@/utils/step-up';

import MfaFactorButton from './MfaFactorButton';
import factorButtonStyles from './MfaFactorButton.module.scss';

export type Props = {
  readonly method: StepUpMethod;
  /** The masked email or phone the code goes to; shown as the subtitle of a code method. */
  readonly maskedIdentifier?: string;
  readonly onClick?: () => void;
};

const stepUpMethodToFactor: Readonly<Partial<Record<StepUpMethod, MfaFactor>>> = Object.freeze({
  ...stepUpMethodToMfaFactor,
  [VerificationType.EmailVerificationCode]: MfaFactor.EmailVerificationCode,
  [VerificationType.PhoneVerificationCode]: MfaFactor.PhoneVerificationCode,
});

/**
 * One entry of the step-up method list, rendered via `MfaFactorButton` for the MFA and code
 * variants, and with a dedicated password button for `VerificationType.Password`.
 */
const StepUpMethodButton = ({ method, maskedIdentifier, onClick }: Props) => {
  const factor = stepUpMethodToFactor[method];

  if (factor) {
    return (
      <MfaFactorButton
        factor={factor}
        isBinding={false}
        maskedIdentifier={maskedIdentifier}
        onClick={onClick}
      />
    );
  }

  return (
    <button
      className={classNames(
        styles.button,
        styles.secondary,
        styles.large,
        factorButtonStyles.mfaFactorButton
      )}
      type="button"
      onClick={onClick}
    >
      <LockIcon className={factorButtonStyles.icon} />
      <div className={factorButtonStyles.title}>
        <div className={factorButtonStyles.name}>
          <DynamicT forKey="step_up.password" />
        </div>
        <div className={factorButtonStyles.description}>
          <DynamicT forKey="step_up.password_description" />
        </div>
      </div>
      <FlipOnRtl>
        <ArrowNext className={factorButtonStyles.icon} />
      </FlipOnRtl>
    </button>
  );
};

export default StepUpMethodButton;
