import { Outlet } from 'react-router-dom';

import Topbar from '@/onboarding/components/Topbar';

import * as styles from './index.module.scss';

const AppContent = () => (
  <div className={styles.app}>
    <Topbar />
    <div className={styles.content}>
      <Outlet />
    </div>
  </div>
);

export default AppContent;
