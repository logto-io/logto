import { useTranslation } from 'react-i18next';

import ClearIcon from '@/assets/icons/clear.svg';

import ActionButton from './index';

type Props = {
  onClick: () => void;
};

function CodeClearButton({ onClick }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <ActionButton
      actionTip={t('jwt_claims.clear')}
      actionSuccessTip={t('jwt_claims.cleared')}
      icon={<ClearIcon />}
      onClick={onClick}
    />
  );
}

export default CodeClearButton;
