import Button from '../Button';
import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<void>;
  onDiscard: () => void;
};

const SubmitFormChangesActionBar = ({ isOpen, isSubmitting, onSubmit, onDiscard }: Props) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.container}>
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
  );
};

export default SubmitFormChangesActionBar;
