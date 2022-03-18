import classNames from 'classnames';
import React, { FC, FormEventHandler, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { signInBasic } from '@/apis/sign-in';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import Input from '@/components/Input';
import PasswordInput from '@/components/Input/PasswordInput';
import TextLink from '@/components/TextLink';
import useApi from '@/hooks/use-api';

import * as styles from './index.module.scss';

const SignIn: FC = () => {
  // TODO: Consider creating cross page data modal
  const { t } = useTranslation();
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
          className={styles.inputField}
          onChange={setUsername}
        />
        <PasswordInput
          name="password"
          autoComplete="current-password"
          isDisabled={loading}
          placeholder={t('sign_in.password')}
          value={password}
          className={styles.inputField}
          onChange={setPassword}
        />
        {error && <ErrorMessage className={styles.box} errorCode={error.code} />}
        <Button isDisabled={loading} type="primary" onClick={signInHandler}>
          {loading ? t('sign_in.loading') : t('sign_in.action')}
        </Button>
        <TextLink
          className={styles.createAccount}
          href="/register"
          text="register.create_account"
        />
      </form>
    </div>
  );
};

export default SignIn;
