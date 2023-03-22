import classNames from 'classnames';
import type { ReactNode } from 'react';

import SubmitFormChangesActionBar from '../SubmitFormChangesActionBar';
import * as styles from './index.module.scss';

type Props = {
  autoComplete?: string;
  isDirty: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<void>;
  onDiscard: () => void;
  children: ReactNode;
};

function DetailsForm({
  autoComplete,
  isDirty,
  isSubmitting,
  onSubmit,
  onDiscard,
  children,
}: Props) {
  return (
    <form
      className={classNames(styles.container, isDirty && styles.withSubmitActionBar)}
      autoComplete={autoComplete}
    >
      <div className={styles.fields}>{children}</div>
      <SubmitFormChangesActionBar
        isOpen={isDirty}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onDiscard={onDiscard}
      />
    </form>
  );
}

export default DetailsForm;
