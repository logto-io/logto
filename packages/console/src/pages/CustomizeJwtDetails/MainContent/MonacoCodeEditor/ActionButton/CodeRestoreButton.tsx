import { useTranslation } from 'react-i18next';

import RedoIcon from '@/assets/icons/redo.svg';

import ActionButton from './index';

type Props = {
  onClick: () => void;
};

function CodeRestoreButton({ onClick }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <ActionButton
      actionTip={t('jwt_claims.restore')}
      actionSuccessTip={t('jwt_claims.restored')}
      icon={<RedoIcon />}
      onClick={onClick}
    />
  );
}

export default CodeRestoreButton;
