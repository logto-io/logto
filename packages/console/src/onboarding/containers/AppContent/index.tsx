import { Outlet } from 'react-router-dom';

import Topbar from '@/onboarding/components/Topbar';

import * as styles from './index.module.scss';

function AppContent() {
  return (
    <div className={styles.app}>
      <Topbar />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}

export default AppContent;
