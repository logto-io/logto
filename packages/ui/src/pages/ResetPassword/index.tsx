import { useTranslation } from 'react-i18next';

import NavBar from '@/components/NavBar';

import * as styles from './index.module.scss';

const ResetPassword = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.wrapper}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.title}>{t('description.new_password')}</div>
      </div>
    </div>
  );
};

export default ResetPassword;
