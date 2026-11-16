import { useParams } from 'react-router-dom';

import PageMeta from '@/components/PageMeta';
import Topbar from '@/components/Topbar';
import { isDevFeaturesEnabled } from '@/consts/env';
import AppBoundary from '@/containers/AppBoundary';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import useCurrentUser from '@/hooks/use-current-user';

import Details from './Details';
import List from './List';
import styles from './index.module.scss';

function SelfHostedLicenses() {
  const { licenseId } = useParams();
  const { user, error: userError } = useCurrentUser();
  // Self-hosted license self-serve purchase is still in development.
  const purchaseUserId = isDevFeaturesEnabled && !userError ? user?.id : undefined;

  return (
    <AppBoundary>
      <div className={styles.pageContainer}>
        <PageMeta titleKey="cloud.self_hosted_licenses.title" />
        <Topbar hideTenantSelector hideTitle />
        <OverlayScrollbar className={styles.scrollable}>
          <div className={styles.wrapper}>
            {licenseId ? (
              <Details key={licenseId} id={licenseId} />
            ) : (
              // Keep purchase state and in-flight requests local to the current account.
              <List key={purchaseUserId} userId={purchaseUserId} />
            )}
          </div>
        </OverlayScrollbar>
      </div>
    </AppBoundary>
  );
}

export default SelfHostedLicenses;
