import { Outlet, useOutletContext } from 'react-router-dom';

import Sidebar from '../AppLayout/components/Sidebar';
import type { AppLayoutOutletContext } from '../AppLayout/types';
import * as styles from './index.module.scss';

const AppContent = () => {
  const { mainRef } = useOutletContext<AppLayoutOutletContext>();

  return (
    <div className={styles.content}>
      <Sidebar />
      <div ref={mainRef} className={styles.main}>
        <Outlet />
      </div>
    </div>
  );
};

export default AppContent;
