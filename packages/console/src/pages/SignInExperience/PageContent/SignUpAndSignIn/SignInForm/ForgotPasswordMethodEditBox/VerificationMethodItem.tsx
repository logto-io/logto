import type { ConnectorType, ForgotPasswordMethod } from '@logto/schemas';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import Draggable from '@/assets/icons/draggable.svg?react';
import Minus from '@/assets/icons/minus.svg?react';
import IconButton from '@/ds-components/IconButton';

import ConnectorSetupWarning from '../../components/ConnectorSetupWarning';

import styles from './index.module.scss';
import { forgotPasswordMethodPhrase } from './utils';

type Props = {
  readonly method: ForgotPasswordMethod;
  readonly requiredConnectors: ConnectorType[];
  readonly hasError?: boolean;
  readonly errorMessage?: string;
  readonly onRemove: () => void;
};

function VerificationMethodItem({
  method,
  requiredConnectors,
  hasError,
  errorMessage,
  onRemove,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div>
      <div className={styles.methodItem}>
        <div className={classNames(styles.methodContent, hasError && styles.error)}>
          <Draggable className={styles.draggableIcon} />
          <span className={styles.methodLabel}>{t(forgotPasswordMethodPhrase[method])}</span>
        </div>
        <IconButton onClick={onRemove}>
          <Minus />
        </IconButton>
      </div>
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
      <ConnectorSetupWarning requiredConnectors={requiredConnectors} />
    </div>
  );
}

export default VerificationMethodItem;
