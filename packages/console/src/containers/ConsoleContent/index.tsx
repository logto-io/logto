import { useOutletContext } from 'react-router-dom';

import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import { useConsoleRoutes } from '@/hooks/use-console-routes';

import type { AppContentOutletContext } from '../AppContent/types';

import Sidebar from './Sidebar';
import * as styles from './index.module.scss';

function ConsoleContent() {
  const { scrollableContent } = useOutletContext<AppContentOutletContext>();
  const routes = useConsoleRoutes();

  return (
    <div className={styles.content}>
      <Sidebar />
      <OverlayScrollbar className={styles.overlayScrollbarWrapper}>
        <div ref={scrollableContent} className={styles.main}>
          {routes}
        </div>
      </OverlayScrollbar>
    </div>
  );
}

export default ConsoleContent;
