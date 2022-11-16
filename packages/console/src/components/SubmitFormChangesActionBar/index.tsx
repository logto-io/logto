import Button from '../Button';
import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  isSubmitting: boolean;
  onDiscard: () => void;
};

const SubmitFormChangesActionBar = ({ isOpen, isSubmitting, onDiscard }: Props) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Button size="medium" title="general.discard" disabled={isSubmitting} onClick={onDiscard} />
      <Button
        isLoading={isSubmitting}
        htmlType="submit"
        type="primary"
        size="medium"
        title="general.save_changes"
      />
    </div>
  );
};

export default SubmitFormChangesActionBar;
