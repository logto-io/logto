import { Outlet } from 'react-router-dom';

import Topbar from '@/containers/AppContent/components/Topbar';

import * as styles from './index.module.scss';

const AppContent = () => (
  <div className={styles.app}>
    <Topbar isLogoOnly />
    <div className={styles.content}>
      <Outlet />
    </div>
  </div>
);

export default AppContent;
