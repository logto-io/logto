import classNames from 'classnames';
import { Outlet } from 'react-router-dom';

import LogtoSignature from '@/components/LogtoSignature';
import DevelopmentTenantNotification from '@/containers/DevelopmentTenantNotification';
import usePlatform from '@/hooks/use-platform';
import { layoutClassNames } from '@/utils/consts';

import CustomContent from './CustomContent';
import styles from './index.module.scss';

const AppLayout = () => {
  const { isMobile } = usePlatform();

  return (
    <div className={styles.viewBox}>
      <div className={classNames(styles.container, layoutClassNames.pageContainer)}>
        {!isMobile && <CustomContent className={layoutClassNames.customContent} />}
        <main className={classNames(styles.main, layoutClassNames.mainContent)}>
          <DevelopmentTenantNotification />
          <Outlet />
          <LogtoSignature className={classNames(styles.signature, layoutClassNames.signature)} />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
