import { useContext } from 'react';
import { Outlet } from 'react-router-dom';

import { PageContext } from '@/hooks/use-page-context';

import * as styles from './index.module.scss';

const AppContent = () => {
  const { platform } = useContext(PageContext);

  return (
    <div className={styles.container}>
      {platform === 'web' && <div className={styles.placeHolder} />}
      <main className={styles.main}>
        <Outlet />
      </main>
      {platform === 'web' && <div className={styles.placeHolder} />}
    </div>
  );
};

export default AppContent;
