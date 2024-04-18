import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import CloudLogo from '@/assets/images/cloud-logo.svg';
import Logo from '@/assets/images/logo.svg';
import { isCloud } from '@/consts/env';
import Spacer from '@/ds-components/Spacer';

import Contact from './Contact';
import DocumentNavButton from './DocumentNavButton';
import TenantSelector from './TenantSelector';
import UserInfo from './UserInfo';
import * as styles from './index.module.scss';

type Props = {
  readonly className?: string;
};

function Topbar({ className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const LogtoLogo = isCloud ? CloudLogo : Logo;

  return (
    <div className={classNames(styles.topbar, className)}>
      <LogtoLogo className={styles.logo} />
      {isCloud && <TenantSelector />}
      {!isCloud && (
        <>
          <div className={styles.line} />
          <div className={styles.text}>{t('title')}</div>
        </>
      )}
      <Spacer />
      <DocumentNavButton />
      <Contact />
      <UserInfo />
    </div>
  );
}

export default Topbar;
