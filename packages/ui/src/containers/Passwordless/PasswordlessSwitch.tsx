import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

import TextLink from '@/components/TextLink';
import { PageContext } from '@/hooks/use-page-context';

type Props = {
  target: 'sms' | 'email';
  className?: string;
};

const PasswordlessSwitch = ({ target, className }: Props) => {
  const { t } = useTranslation();
  const { experienceSettings } = useContext(PageContext);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (!experienceSettings) {
    return null;
  }

  if (
    experienceSettings.primarySignInMethod !== target &&
    !experienceSettings.secondarySignInMethods.includes(target)
  ) {
    return null;
  }

  const targetPathname = pathname.replace(target === 'email' ? 'sms' : 'email', target);

  return (
    <TextLink
      className={className}
      onClick={() => {
        navigate({
          pathname: targetPathname,
        });
      }}
    >
      {t('action.switch_to', {
        method: t(`description.${target === 'email' ? 'email' : 'phone_number'}`),
      })}
    </TextLink>
  );
};

export default PasswordlessSwitch;
