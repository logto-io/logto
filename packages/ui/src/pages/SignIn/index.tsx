import React, { FC, FormEventHandler, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import { signInBasic } from '@/apis/sign-in';
import Button from '@/components/Button';
import Input from '@/components/Input';
import MessageBox from '@/components/MessageBox';
import TextLink from '@/components/TextLink';

import styles from './index.module.scss';

export type PageState = 'idle' | 'loading' | 'error';

const Home: FC = () => {
  // TODO: Consider creading cross page data modal
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pageState, setPageState] = useState<PageState>('idle');
  const isLoading = pageState === 'loading';

  const signIn: FormEventHandler = useCallback(
    async (event) => {
      event.preventDefault();
      setPageState('loading');
      try {
        window.location.href = (await signInBasic(username, password)).redirectTo;
      } catch {
        // TODO: Show specific error after merge into monorepo
        setPageState('error');
      }
    },
    [username, password]
  );

  return (
    <div className={classNames(styles.wrapper)}>
      <form className={classNames(styles.form)}>
        <div className={styles.title}>Sign in to Logto</div>
        <Input
          name="username"
          autoComplete="username"
          isDisabled={isLoading}
          placeholder={t('sign_in.username')}
          value={username}
          onChange={setUsername}
        />
        <Input
          name="password"
          autoComplete="current-password"
          isDisabled={isLoading}
          placeholder={t('sign_in.password')}
          type="password"
          value={password}
          onChange={setPassword}
        />
        {pageState === 'error' && (
          <MessageBox className={styles.box}>{t('sign_in.error')}</MessageBox>
        )}
        <Button
          isDisabled={isLoading}
          value={isLoading ? t('sign_in.loading') : t('sign_in.title')}
          onClick={signIn}
        />
        <TextLink className={styles.createAccount} href="/register">
          {t('register.create_account')}
        </TextLink>
      </form>
    </div>
  );
};

export default Home;
