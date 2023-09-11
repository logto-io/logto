import { conditional, joinPath } from '@silverhand/essentials';
import { useRef } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import MauExceededModal from '@/components/MauExceededModal';
import PaymentOverdueModal from '@/components/PaymentOverdueModal';
import { isCloud } from '@/consts/env';
import useScroll from '@/hooks/use-scroll';
import useUserPreferences from '@/hooks/use-user-preferences';

import { getPath } from '../ConsoleContent/Sidebar';
import { useSidebarMenuItems } from '../ConsoleContent/Sidebar/hook';

import Topbar from './components/Topbar';
import * as styles from './index.module.scss';
import { type AppContentOutletContext } from './types';

export default function AppContent() {
  const { isLoading } = useUserPreferences();

  const scrollableContent = useRef<HTMLDivElement>(null);
  const { scrollTop } = useScroll(scrollableContent.current);

  if (isLoading) {
    return <AppLoading />;
  }

  return (
    <>
      <div className={styles.app}>
        <Topbar className={conditional(scrollTop && styles.topbarShadow)} />
        <Outlet context={{ scrollableContent } satisfies AppContentOutletContext} />
      </div>
      {isCloud && (
        <>
          <MauExceededModal />
          <PaymentOverdueModal />
        </>
      )}
    </>
  );
}

export function RedirectToFirstItem() {
  const { tenantId } = useParams();
  const { firstItem } = useSidebarMenuItems();

  if (!firstItem) {
    throw new Error('First sidebar item not found');
  }

  if (!tenantId) {
    throw new Error('Tenant ID not found');
  }

  return <Navigate replace to={joinPath(tenantId, getPath(firstItem.title))} />;
}
