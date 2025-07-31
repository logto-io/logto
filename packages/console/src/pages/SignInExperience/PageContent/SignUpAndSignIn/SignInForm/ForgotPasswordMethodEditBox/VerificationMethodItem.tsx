import type { ForgotPasswordMethod } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import Draggable from '@/assets/icons/draggable.svg?react';
import Minus from '@/assets/icons/minus.svg?react';
import IconButton from '@/ds-components/IconButton';

import styles from './index.module.scss';
import { forgotPasswordMethodPhrase } from './utils';

type Props = {
  readonly method: ForgotPasswordMethod;
  readonly onRemove: () => void;
};

function VerificationMethodItem({ method, onRemove }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.methodItem}>
      <div className={styles.methodContent}>
        <Draggable className={styles.draggableIcon} />
        <span className={styles.methodLabel}>{t(forgotPasswordMethodPhrase[method])}</span>
      </div>
      <IconButton onClick={onRemove}>
        <Minus />
      </IconButton>
    </div>
  );
}

export default VerificationMethodItem;
