import { type AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';

import Button from '@/ds-components/Button';

import * as styles from './index.module.scss';

type Props = {
  readonly isOpen: boolean;
  readonly isSubmitting: boolean;
  readonly onSubmit: () => Promise<void>;
  readonly onDiscard: () => void;
  readonly confirmText?: AdminConsoleKey;
  readonly className?: string;
};

function SubmitFormChangesActionBar({
  isOpen,
  isSubmitting,
  confirmText = 'general.save_changes',
  onSubmit,
  onDiscard,
  className,
}: Props) {
  return (
    <div className={classNames(styles.container, isOpen && styles.active, className)}>
      <div className={styles.actionBar}>
        <Button
          size="medium"
          title="general.discard"
          disabled={isSubmitting}
          onClick={() => {
            onDiscard();
          }}
        />
        <Button
          isLoading={isSubmitting}
          type="primary"
          size="medium"
          title={confirmText}
          onClick={async () => onSubmit()}
        />
      </div>
    </div>
  );
}

export default SubmitFormChangesActionBar;
