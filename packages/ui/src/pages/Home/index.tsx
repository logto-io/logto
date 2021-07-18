import Input from '@/components/Input';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './index.module.scss';

const Home = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>登录 Logto</div>
      <Input placeholder={t('sign-in.username')} value={username} onChange={setUsername} />
      <Input
        placeholder={t('sign-in.password')}
        type="password"
        value={password}
        onChange={setPassword}
      />
    </div>
  );
};

export default Home;
