import classNames from 'classnames';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/Button';
import useBindSocial from '@/hooks/use-bind-social';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  connectorId: string;
};

const SocialCreateAccount = ({ connectorId, className }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const { relatedUser, registerWithSocial, bindSocialRelatedUser } = useBindSocial();

  const signInHandler = useCallback(() => {
    // TODO: redirect to desired sign-in page
    navigate('/sign-in/username/' + connectorId);
  }, [connectorId, navigate]);

  return (
    <div className={classNames(styles.container, className)}>
      {relatedUser && (
        <>
          <div className={styles.desc}>{t('description.social_bind_with_existing')}</div>
          <Button
            onClick={() => {
              bindSocialRelatedUser(connectorId);
            }}
          >
            {t('action.bind', { address: relatedUser })}
          </Button>
        </>
      )}
      <div className={styles.desc}>{t('description.social_create_account')}</div>
      <Button
        type={relatedUser ? 'secondary' : 'primary'}
        onClick={() => {
          registerWithSocial(connectorId);
        }}
      >
        {t('action.create')}
      </Button>
      <div className={styles.desc}>{t('description.social_bind_account')}</div>
      <Button type="secondary" onClick={signInHandler}>
        {t('action.sign_in')}
      </Button>
    </div>
  );
};

export default SocialCreateAccount;
