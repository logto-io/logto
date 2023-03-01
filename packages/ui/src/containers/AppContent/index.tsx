import { Outlet } from 'react-router-dom';

import LogtoSignature from '@/components/LogtoSignature';
import usePlatform from '@/hooks/use-platform';

import * as styles from './index.module.scss';

const AppContent = () => {
  const { isMobile } = usePlatform();

  return (
    <div className={styles.viewBox}>
      <div className={styles.container}>
        <div className={styles.placeHolder} />
        <main className={styles.main}>
          <Outlet />
          {isMobile && <LogtoSignature />}
        </main>
        {!isMobile && <LogtoSignature />}
        <div className={styles.placeHolder} />
      </div>
    </div>
  );
};

export default AppContent;
