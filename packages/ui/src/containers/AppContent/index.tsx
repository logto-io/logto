import { Outlet } from 'react-router-dom';

import * as styles from './index.module.scss';

const AppContent = () => {
  return (
    <div className={styles.viewBox}>
      <div className={styles.container}>
        <div className={styles.placeHolder} />
        <main className={styles.main}>
          <Outlet />
        </main>
        <div className={styles.placeHolder} />
      </div>
    </div>
  );
};

export default AppContent;
