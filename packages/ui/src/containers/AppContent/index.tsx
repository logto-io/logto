import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import LogtoSignature from '@/components/LogtoSignature';
import usePlatform from '@/hooks/use-platform';
import { parseHtmlTitle } from '@/utils/sign-in-experience';

import * as styles from './index.module.scss';

const AppContent = () => {
  const { isMobile } = usePlatform();
  const location = useLocation();

  useEffect(() => {
    const { pathname } = location;
    const title = parseHtmlTitle(pathname);

    if (title) {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      document.title = title;
    }
  }, [location]);

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
