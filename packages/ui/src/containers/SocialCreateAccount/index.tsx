import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import useBindSocial from '@/hooks/use-bind-social';
import { useSieMethods } from '@/hooks/use-sie';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  connectorId: string;
};

const SocialCreateAccount = ({ connectorId, className }: Props) => {
  const { t } = useTranslation();

  const { relatedUser, socialIdentity, registerWithSocial, bindSocialRelatedUser } =
    useBindSocial();

  const { signInMethods } = useSieMethods();

  const relatedIdentifier = relatedUser && socialIdentity?.[relatedUser.type];

  return (
    <div className={classNames(styles.container, className)}>
      {relatedIdentifier && (
        <>
          <div className={styles.desc}>{t('description.social_bind_with_existing')}</div>
          <Button
            title="action.bind"
            i18nProps={{ address: relatedUser.value }}
            onClick={() => {
              bindSocialRelatedUser({
                connectorId,
                ...(relatedUser.type === 'email'
                  ? { email: relatedIdentifier }
                  : { phone: relatedIdentifier }),
              });
            }}
          />
        </>
      )}
      <div className={styles.desc}>{t('description.social_create_account')}</div>
      <Button
        title="action.create"
        type={relatedUser ? 'secondary' : 'primary'}
        onClick={() => {
          registerWithSocial(connectorId);
        }}
      />
    </div>
  );
};

export default SocialCreateAccount;
