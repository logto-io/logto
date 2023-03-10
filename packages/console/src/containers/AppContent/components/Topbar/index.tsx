import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import Logo from '@/assets/images/logo.svg';
import Spacer from '@/components/Spacer';
import { isCloud } from '@/consts/cloud';
import EarlyBirdGift from '@/onboarding/components/EarlyBirdGift';
import GetStartedProgress from '@/pages/GetStarted/components/GetStartedProgress';

import UserInfo from '../UserInfo';
import * as styles from './index.module.scss';

type Props = {
  isLogoOnly?: boolean;
  className?: string;
};

const Topbar = ({ isLogoOnly = false, className }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={classNames(styles.topbar, className)}>
      <Logo className={styles.logo} />
      <div className={styles.line} />
      <div className={styles.text}>{t('title')}</div>
      <Spacer />
      {!isLogoOnly && (
        <>
          <GetStartedProgress />
          {isCloud && <EarlyBirdGift />}
          <UserInfo />
        </>
      )}
    </div>
  );
};

export default Topbar;
