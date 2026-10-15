import { type InteractionAuthenticationContext } from '@logto/schemas';

import StepUpMethodButton from '@/components/Button/StepUpMethodButton';
import { getMaskedIdentifier, type StepUpMethod } from '@/utils/step-up';

import styles from './index.module.scss';
import useSelectStepUpMethod from './use-select-step-up-method';

type Props = {
  /** The methods to offer, in the server's order. */
  readonly methods: readonly StepUpMethod[];
  readonly authenticationContext: Pick<InteractionAuthenticationContext, 'maskedIdentifiers'>;
};

/**
 * The step-up method chooser, modeled on `MfaFactorList`: one button per method Core offers,
 * with the server-provided masked identifier as the subtitle of a code method. The list renders
 * only what it is given; it never decides which methods are eligible.
 */
const StepUpMethodList = ({ methods, authenticationContext }: Props) => {
  const selectMethod = useSelectStepUpMethod({ methods, authenticationContext });

  return (
    <div className={styles.methodList}>
      {methods.map((method) => (
        <StepUpMethodButton
          key={method}
          method={method}
          maskedIdentifier={getMaskedIdentifier(method, authenticationContext.maskedIdentifiers)}
          onClick={async () => {
            await selectMethod(method);
          }}
        />
      ))}
    </div>
  );
};

export default StepUpMethodList;
