import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import shallow from 'zustand/shallow.js';

import Button from '@/components/Button';
import Input from '@/components/Input';
import MessageBox from '@/components/MessageBox';
import TextLink from '@/components/TextLink';
import useStore from '@/store';

import styles from './index.module.scss';

const Home: FC = () => {
  const { t } = useTranslation();

  const { username, password, pageState, setPassword, setUsername, signIn } = useStore(
    (state) => state,
    shallow
  );

  const isLoading = pageState === 'loading';
  const isError = pageState === 'error';

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
        {isError && <MessageBox className={styles.box}>{t('sign_in.error')}</MessageBox>}
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
