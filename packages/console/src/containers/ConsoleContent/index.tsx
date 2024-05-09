import { useOutletContext, useRoutes } from 'react-router-dom';

import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import { useConsoleRoutes } from '@/hooks/use-console-routes';
import { usePlausiblePageview } from '@/hooks/use-plausible-pageview';

import type { AppContentOutletContext } from '../AppContent/types';

import Sidebar from './Sidebar';
import useTenantScopeListener from './hooks';
import * as styles from './index.module.scss';

function ConsoleContent() {
  const { scrollableContent } = useOutletContext<AppContentOutletContext>();
  const routeObjects = useConsoleRoutes();
  const routes = useRoutes(routeObjects);
  usePlausiblePageview(routeObjects);

  // Use this hook here to make sure console listens to user tenant scope changes.
  useTenantScopeListener();

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
