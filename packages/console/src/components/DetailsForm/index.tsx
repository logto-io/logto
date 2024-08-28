import classNames from 'classnames';
import type { ReactNode } from 'react';

import SubmitFormChangesActionBar from '../SubmitFormChangesActionBar';

import * as styles from './index.module.scss';

type Props = {
  readonly autoComplete?: string;
  readonly isDirty: boolean;
  readonly isSubmitting: boolean;
  readonly onSubmit: () => Promise<void>;
  readonly onDiscard: () => void;
  readonly children: ReactNode;
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
