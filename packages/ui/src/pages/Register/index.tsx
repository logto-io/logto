import { LogtoErrorI18nKey } from '@logto/phrases';
import classNames from 'classnames';
import React, { FC, FormEventHandler, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { register } from '@/apis/register';
import Button from '@/components/Button';
import Input from '@/components/Input';
import MessageBox from '@/components/MessageBox';
import TextLink from '@/components/TextLink';
import useApi from '@/hooks/use-api';

import styles from './index.module.scss';

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
      window.location.href = result.redirectTo;
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
        <Input
          name="password"
          isDisabled={loading}
          placeholder={t('sign_in.password')}
          type="password"
          value={password}
          onChange={setPassword} // TODO: password validation
        />
        {error && (
          <MessageBox className={styles.box}>
            {i18n.t<string, LogtoErrorI18nKey>(`errors:${error.code}`)}
          </MessageBox>
        )}
        <Button
          isDisabled={loading}
          value={loading ? t('register.loading') : t('register.action')}
          onClick={signUp}
        />

        <div className={styles.haveAccount}>
          <span className={styles.prefix}>{t('register.have_account')}</span>
          <TextLink href="/sign-in">{t('sign_in.action')}</TextLink>
        </div>
      </form>
    </div>
  );
};

export default Register;
