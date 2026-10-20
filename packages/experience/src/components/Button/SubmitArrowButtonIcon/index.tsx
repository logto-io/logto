import SubmitArrowIcon from '@/assets/icons/submit-arrow.svg?react';

import styles from './index.module.scss';

const SubmitArrowButtonIcon = () => {
  return (
    <span aria-hidden className={styles.badge}>
      <SubmitArrowIcon />
    </span>
  );
};

export default SubmitArrowButtonIcon;
