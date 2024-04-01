import { type AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';

import Button from '@/ds-components/Button';

import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<void>;
  onDiscard: () => void;
  confirmText?: AdminConsoleKey;
};

function SubmitFormChangesActionBar({
  isOpen,
  isSubmitting,
  confirmText = 'general.save_changes',
  onSubmit,
  onDiscard,
}: Props) {
  return (
    <div className={classNames(styles.container, isOpen && styles.active)}>
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
