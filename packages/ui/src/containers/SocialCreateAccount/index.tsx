import { Optional } from '@silverhand/essentials';
import classNames from 'classnames';
import React, { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

import { registerWithSocial, bindSocialRelatedUser } from '@/apis/social';
import Button from '@/components/Button';
import useApi from '@/hooks/use-api';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  connector: string;
};

type LocationState = {
  relatedUser?: string;
};

const SocialCreateAccount = ({ connector, className }: Props) => {
  const navigate = useNavigate();
  const state = useLocation().state as Optional<LocationState>;
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });

  const { result: registerResult, run: asyncRegisterWithSocial } = useApi(registerWithSocial);
  const { result: bindUserResult, run: asyncBindSocialRelatedUser } = useApi(bindSocialRelatedUser);

  const createAccountHandler = useCallback(() => {
    void asyncRegisterWithSocial(connector);
  }, [asyncRegisterWithSocial, connector]);

  const bindRelatedUserHandler = useCallback(() => {
    void asyncBindSocialRelatedUser(connector);
  }, [asyncBindSocialRelatedUser, connector]);

  const signInHandler = useCallback(() => {
    navigate('/sign-in/bind/' + connector);
  }, [connector, navigate]);

  useEffect(() => {
    if (registerResult?.redirectTo) {
      window.location.assign(registerResult.redirectTo);
    }
  }, [registerResult]);

  useEffect(() => {
    if (bindUserResult?.redirectTo) {
      window.location.assign(bindUserResult.redirectTo);
    }
  }, [bindUserResult]);

  return (
    <div className={classNames(styles.container, className)}>
      {state?.relatedUser && (
        <>
          <div className={styles.desc}>{t('description.social_bind_with_existing')}</div>
          <Button onClick={bindRelatedUserHandler}>
            {t('action.bind', { address: state.relatedUser })}
          </Button>
        </>
      )}
      <div className={styles.desc}>{t('description.social_create_account')}</div>
      <Button type={state?.relatedUser ? 'secondary' : 'primary'} onClick={createAccountHandler}>
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
