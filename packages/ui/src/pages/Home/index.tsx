import Button from '@/components/Button';
import Input from '@/components/Input';
import MessageBox from '@/components/MessageBox';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './index.module.scss';

export type PageState = 'idle' | 'loading' | 'error';

const Home = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pageState, setPageState] = useState<PageState>('idle');
  const isLoading = pageState === 'loading';

  return (
    <form className={styles.wrapper}>
      <div className={styles.title}>登录 Logto</div>
      <Input
        autoComplete="username"
        isDisabled={isLoading}
        placeholder={t('sign-in.username')}
        value={username}
        onChange={setUsername}
      />
      <Input
        autoComplete="current-password"
        isDisabled={isLoading}
        placeholder={t('sign-in.password')}
        type="password"
        value={password}
        onChange={setPassword}
      />
      {pageState === 'error' && (
        <MessageBox className={styles.box}>{t('sign-in.error')}</MessageBox>
      )}
      <Button
        isDisabled={isLoading}
        value={isLoading ? t('sign-in.loading') : t('sign-in')}
        onClick={() => {
          setPageState('loading');
        }}
      />
    </form>
  );
};

export default Home;
