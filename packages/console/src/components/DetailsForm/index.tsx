import { forwardRef } from 'react';
import type { ForwardedRef, HTMLProps, ReactNode } from 'react';

import SubmitFormChangesActionBar from '../SubmitFormChangesActionBar';
import * as styles from './index.module.scss';

type Props = HTMLProps<HTMLFormElement> & {
  isDirty: boolean;
  isSubmitting: boolean;
  children: ReactNode;
  onDiscard: () => void;
};

const DetailsForm = (
  { isDirty, isSubmitting, onDiscard, children, ...rest }: Props,
  reference: ForwardedRef<HTMLFormElement>
) => {
  return (
    <form {...rest} ref={reference} className={styles.container}>
      <div className={styles.fields}>{children}</div>
      <SubmitFormChangesActionBar
        isOpen={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={onDiscard}
      />
    </form>
  );
};

export default forwardRef(DetailsForm);
