import { signInBasic } from '@/apis/sign-in';
import Button from '@/components/Button';
import Input from '@/components/Input';
import MessageBox from '@/components/MessageBox';
import TextLink from '@/components/TextLink';
import React, { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './index.module.scss';

export type PageState = 'idle' | 'loading' | 'error';

const Home = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pageState, setPageState] = useState<PageState>('idle');
  const isLoading = pageState === 'loading';

  const signIn: FormEventHandler = async (event) => {
    event.preventDefault();
    setPageState('loading');
    try {
      window.location.href = (await signInBasic(username, password)).redirectTo;
    } catch {
      // TODO: Show specific error after merge into monorepo
      setPageState('error');
    }
  };

  return (
    <form className={styles.wrapper}>
      <div className={styles.title}>Sign in to Logto</div>
      <Input
        autoComplete="username"
        isDisabled={isLoading}
        placeholder={t('sign_in.username')}
        value={username}
        onChange={setUsername}
      />
      <Input
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
        value={isLoading ? t('sign_in.loading') : t('sign_in')}
        onClick={signIn}
      />
      <TextLink className={styles.createAccount} href="/register">
        {t('register.create_account')}
      </TextLink>
    </form>
  );
};

export default Home;
