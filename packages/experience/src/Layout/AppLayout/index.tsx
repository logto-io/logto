import classNames from 'classnames';
import { useContext } from 'react';
import { Outlet } from 'react-router-dom';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import LogtoSignature from '@/components/LogtoSignature';
import usePlatform from '@/hooks/use-platform';
import { layoutClassNames } from '@/utils/consts';

import CustomContent from './CustomContent';
import styles from './index.module.scss';

const AppLayout = () => {
  const { experienceSettings } = useContext(PageContext);
  const { isMobile } = usePlatform();
  const hideLogtoBranding = experienceSettings?.hideLogtoBranding === true;

  return (
    <div className={styles.viewBox}>
      <div className={classNames(styles.container, layoutClassNames.pageContainer)}>
        {!isMobile && <CustomContent className={layoutClassNames.customContent} />}
        <main className={classNames(styles.main, layoutClassNames.mainContent)}>
          <Outlet />
          {!hideLogtoBranding && (
            <LogtoSignature className={classNames(styles.signature, layoutClassNames.signature)} />
          )}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
