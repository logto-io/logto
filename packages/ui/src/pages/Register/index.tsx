import { LogtoErrorI18nKey } from '@logto/phrases';
import classNames from 'classnames';
import React, { FC, FormEventHandler, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { register } from '@/apis/register';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import Input from '@/components/Input';
import PasswordInput from '@/components/Input/PasswordInput';
import TextLink from '@/components/TextLink';
import useApi from '@/hooks/use-api';

import * as styles from './index.module.scss';

const Register: FC = () => {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { loading, error, result, run: asyncRegister } = useApi(register);

  const signUp: FormEventHandler = useCallback(
    async (event) => {
      event.preventDefault();
      await asyncRegister(username, password);
    },
    [username, password, asyncRegister]
  );

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.assign(result.redirectTo);
    }
  }, [result]);

  return (
    <div className={classNames(styles.wrapper)}>
      <form className={classNames(styles.form)}>
        <div className={styles.title}>{t('register.create_account')}</div>
        <Input
          name="username"
          isDisabled={loading}
          placeholder={t('sign_in.username')}
          value={username}
          onChange={setUsername} // TODO: account validation
        />
        <PasswordInput
          name="password"
          isDisabled={loading}
          placeholder={t('sign_in.password')}
          value={password}
          onChange={setPassword} // TODO: password validation
        />
        {error && (
          <ErrorMessage className={styles.box}>
            {i18n.t<string, LogtoErrorI18nKey>(`errors:${error.code}`)}
          </ErrorMessage>
        )}
        <Button isDisabled={loading} onClick={signUp}>
          {loading ? t('register.loading') : t('register.action')}
        </Button>

        <div className={styles.haveAccount}>
          <span className={styles.prefix}>{t('register.have_account')}</span>
          <TextLink href="/sign-in">{t('sign_in.action')}</TextLink>
        </div>
      </form>
    </div>
  );
};

export default Register;
