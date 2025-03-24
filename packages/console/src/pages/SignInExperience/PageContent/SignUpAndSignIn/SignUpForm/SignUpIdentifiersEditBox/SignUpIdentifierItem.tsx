import {
  AlternativeSignUpIdentifier,
  type ConnectorType,
  type SignUpIdentifier,
} from '@logto/schemas';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import Draggable from '@/assets/icons/draggable.svg?react';
import Minus from '@/assets/icons/minus.svg?react';
import IconButton from '@/ds-components/IconButton';

import ConnectorSetupWarning from '../../components/ConnectorSetupWarning';

import styles from './SignUpIdentifierItem.module.scss';

type Props = {
  readonly identifier: SignUpIdentifier;
  readonly requiredConnectors: ConnectorType[];
  readonly hasError?: boolean;
  readonly errorMessage?: string;
  readonly onDelete: () => void;
};

function SignUpIdentifierItem({
  identifier,
  requiredConnectors,
  hasError,
  errorMessage,
  onDelete,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div>
      <div key={identifier} className={styles.signUpMethodItem}>
        <div className={classNames(styles.signUpMethod, hasError && styles.error)}>
          <Draggable className={styles.draggableIcon} />
          {t(
            `sign_in_exp.sign_up_and_sign_in.identifiers_${
              identifier === AlternativeSignUpIdentifier.EmailOrPhone ? 'email_or_sms' : identifier
            }`
          )}
        </div>
        <IconButton onClick={onDelete}>
          <Minus />
        </IconButton>
      </div>
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
      <ConnectorSetupWarning requiredConnectors={requiredConnectors} />
    </div>
  );
}

export default SignUpIdentifierItem;
