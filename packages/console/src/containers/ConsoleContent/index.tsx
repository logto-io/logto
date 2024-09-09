import classNames from 'classnames';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useRoutes } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

import DelayedSuspenseFallback from '@/components/DelayedSuspenseFallback';
import { isDevFeaturesEnabled } from '@/consts/env';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import Tag from '@/ds-components/Tag';
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
  const { i18n } = useTranslation();
  const direction = i18n.dir();

  usePlausiblePageview(routeObjects, ':tenantId');
  // Use this hook here to make sure console listens to user tenant scope changes.
  useTenantScopeListener();

  return (
    <div className={styles.content}>
      <Suspense fallback={<Skeleton />}>
        <Sidebar />
      </Suspense>
      <OverlayScrollbar className={styles.overlayScrollbarWrapper}>
        <div ref={scrollableContent} className={classNames(styles.main, styles[direction])}>
          <Suspense fallback={<DelayedSuspenseFallback />}>{routes}</Suspense>
        </div>
      </OverlayScrollbar>
      {isDevFeaturesEnabled && (
        <Tag
          type="state"
          status="success"
          variant="plain"
          className={classNames(styles.devStatus, styles[direction])}
        >
          Dev features enabled
        </Tag>
      )}
    </div>
  );
}

export default ConsoleContent;
