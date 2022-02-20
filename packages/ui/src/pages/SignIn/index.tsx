import { LogtoErrorI18nKey } from '@logto/phrases';
import classNames from 'classnames';
import React, { FC, FormEventHandler, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { signInBasic } from '@/apis/sign-in';
import Button from '@/components/Button';
import Input from '@/components/Input';
import MessageBox from '@/components/MessageBox';
import TextLink from '@/components/TextLink';
import useApi from '@/hooks/use-api';

import * as styles from './index.module.scss';

const SignIn: FC = () => {
  // TODO: Consider creating cross page data modal
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { loading, error, result, run: asyncSignInBasic } = useApi(signInBasic);

  const signInHandler: FormEventHandler = useCallback(
    async (event) => {
      event.preventDefault();
      await asyncSignInBasic(username, password);
    },
    [username, password, asyncSignInBasic]
  );

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.assign(result.redirectTo);
    }
  }, [result]);

  return (
    <div className={classNames(styles.wrapper)}>
      <form className={classNames(styles.form)}>
        <div className={styles.title}>Sign in to Logto</div>
        <Input
          name="username"
          autoComplete="username"
          isDisabled={loading}
          placeholder={t('sign_in.username')}
          value={username}
          onChange={setUsername}
        />
        <Input
          name="password"
          autoComplete="current-password"
          isDisabled={loading}
          placeholder={t('sign_in.password')}
          type="password"
          value={password}
          onChange={setPassword}
        />
        {error && (
          <MessageBox className={styles.box}>
            {i18n.t<string, LogtoErrorI18nKey>(`errors:${error.code}`)}
          </MessageBox>
        )}
        <Button
          isDisabled={loading}
          value={loading ? t('sign_in.loading') : t('sign_in.action')}
          onClick={signInHandler}
        />
        <TextLink className={styles.createAccount} href="/register">
          {t('register.create_account')}
        </TextLink>
      </form>
    </div>
  );
};

export default SignIn;
