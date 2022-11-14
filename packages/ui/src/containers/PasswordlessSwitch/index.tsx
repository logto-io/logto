import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import TextLink from '@/components/TextLink';

type Props = {
  target: 'sms' | 'email';
  className?: string;
};

const PasswordlessSwitch = ({ target, className }: Props) => {
  const { t } = useTranslation();
  const { pathname, search } = useLocation();

  const targetPathname = pathname.split('/').slice(0, -1).join('/') + `/${target}`;

  return (
    <TextLink replace className={className} to={{ pathname: targetPathname, search }}>
      {t('action.switch_to', {
        method: t(`description.${target === 'email' ? 'email' : 'phone_number'}`),
      })}
    </TextLink>
  );
};

export default PasswordlessSwitch;
