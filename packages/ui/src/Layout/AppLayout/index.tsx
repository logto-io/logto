import classNames from 'classnames';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import LogtoSignature from '@/components/LogtoSignature';
import usePlatform from '@/hooks/use-platform';
import { layoutClassNames } from '@/utils/consts';
import { parseHtmlTitle } from '@/utils/sign-in-experience';

import CustomContent from './CustomContent';
import * as styles from './index.module.scss';

const AppLayout = () => {
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
      <div className={classNames(styles.container, layoutClassNames.pageContainer)}>
        {!isMobile && <CustomContent className={layoutClassNames.customContent} />}
        <main className={classNames(styles.main, layoutClassNames.mainContent)}>
          <Outlet />
          {isMobile && <LogtoSignature className={layoutClassNames.signature} />}
        </main>
        {!isMobile && <LogtoSignature className={layoutClassNames.signature} />}
      </div>
    </div>
  );
};

export default AppLayout;
