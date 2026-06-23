import { Suspense } from 'react';
import { useOutletContext, useRoutes } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

import DelayedSuspenseFallback from '@/components/DelayedSuspenseFallback';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import { useConsoleRoutes } from '@/hooks/use-console-routes';
import { usePlausiblePageview } from '@/hooks/use-plausible-pageview';

import type { AppContentOutletContext } from '../AppContent/types';

import { Skeleton } from './Sidebar';
import useTenantScopeListener from './hooks';
import styles from './index.module.scss';

const Sidebar = safeLazy(async () => import('./Sidebar'));

function ConsoleContent() {
  const { scrollableContent } = useOutletContext<AppContentOutletContext>();
  const routeObjects = useConsoleRoutes();
  const routes = useRoutes(routeObjects);

  usePlausiblePageview(routeObjects, ':tenantId');
  // Use this hook here to make sure console listens to user tenant scope changes.
  useTenantScopeListener();

  return (
    <div className={styles.content}>
      <Suspense fallback={<Skeleton />}>
        <Sidebar />
      </Suspense>
      <OverlayScrollbar className={styles.overlayScrollbarWrapper}>
        <div ref={scrollableContent} className={styles.main}>
          <Suspense fallback={<DelayedSuspenseFallback />}>{routes}</Suspense>
        </div>
      </OverlayScrollbar>
    </div>
  );
}

export default ConsoleContent;
