import React, { FC, FormEventHandler, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import { register } from '@/apis/register';
import Button from '@/components/Button';
import Input from '@/components/Input';
import MessageBox from '@/components/MessageBox';
import TextLink from '@/components/TextLink';

import styles from './index.module.scss';

export type PageState = 'idle' | 'loading' | 'error';

const App: FC = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pageState, setPageState] = useState<PageState>('idle');
  const isLoading = pageState === 'loading';

  const signUp: FormEventHandler = useCallback(
    async (event) => {
      event.preventDefault();
      setPageState('loading');
      try {
        window.location.href = (await register(username, password)).redirectTo;
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
        <div className={styles.title}>{t('register.create_account')}</div>
        <Input
          name="username"
          isDisabled={isLoading}
          placeholder={t('sign_in.username')}
          value={username}
          onChange={setUsername} // TODO: account validation
        />
        <Input
          name="password"
          isDisabled={isLoading}
          placeholder={t('sign_in.password')}
          type="password"
          value={password}
          onChange={setPassword} // TODO: password validation
        />
        {pageState === 'error' && (
          <MessageBox className={styles.box}>{t('sign_in.error')}</MessageBox>
        )}
        <Button
          isDisabled={isLoading}
          value={isLoading ? t('register.loading') : t('register.title')}
          onClick={signUp}
        />

        <div className={styles.haveAccount}>
          <span className={styles.prefix}>{t('register.have_account')}</span>
          <TextLink href="/sign-in">{t('sign_in.title')}</TextLink>
        </div>
      </form>
    </div>
  );
};

export default App;
