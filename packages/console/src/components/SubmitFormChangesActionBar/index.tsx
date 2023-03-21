import classNames from 'classnames';

import Button from '../Button';
import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<void>;
  onDiscard: () => void;
};

function SubmitFormChangesActionBar({ isOpen, isSubmitting, onSubmit, onDiscard }: Props) {
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
          title="general.save_changes"
          onClick={async () => onSubmit()}
        />
      </div>
    </div>
  );
}

export default SubmitFormChangesActionBar;
