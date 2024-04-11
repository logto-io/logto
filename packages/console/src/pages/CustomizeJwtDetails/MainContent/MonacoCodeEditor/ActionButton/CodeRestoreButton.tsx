import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import RedoIcon from '@/assets/icons/redo.svg';

import ActionButton from './index';
import * as styles from './index.module.scss';

type Props = {
  className?: string;
  onClick: () => void;
};

function CodeRestoreButton({ className, onClick }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <ActionButton
      className={classNames(className, styles.actionButton)}
      actionTip={t('jwt_claims.restore')}
      actionSuccessTip={t('jwt_claims.restored')}
      icon={<RedoIcon />}
      onClick={onClick}
    />
  );
}

export default CodeRestoreButton;
