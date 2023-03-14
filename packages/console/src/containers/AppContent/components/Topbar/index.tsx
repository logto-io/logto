import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import CloudLogo from '@/assets/images/cloud-logo.svg';
import Logo from '@/assets/images/logo.svg';
import Spacer from '@/components/Spacer';
import { isCloud } from '@/consts/cloud';
import EarlyBirdGift from '@/onboarding/components/EarlyBirdGift';
import GetStartedProgress from '@/pages/GetStarted/components/GetStartedProgress';

import UserInfo from '../UserInfo';
import * as styles from './index.module.scss';

type Props = {
  className?: string;
};

const Topbar = ({ className }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const LogtoLogo = isCloud ? CloudLogo : Logo;

  return (
    <div className={classNames(styles.topbar, className)}>
      <LogtoLogo className={styles.logo} />
      {!isCloud && (
        <>
          <div className={styles.line} />
          <div className={styles.text}>{t('title')}</div>
        </>
      )}
      <Spacer />
      <GetStartedProgress />
      {isCloud && <EarlyBirdGift />}
      <UserInfo />
    </div>
  );
};

export default Topbar;
