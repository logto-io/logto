import { useParams } from 'react-router-dom';

import PageMeta from '@/components/PageMeta';
import Topbar from '@/components/Topbar';
import { isDevFeaturesEnabled } from '@/consts/env';
import { selfHostedLicenseGuideLink } from '@/consts/external-links';
import AppBoundary from '@/containers/AppBoundary';
import CardTitle from '@/ds-components/CardTitle';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import useCurrentUser from '@/hooks/use-current-user';

import Details from './Details';
import List from './List';
import Purchase from './Purchase';
import styles from './index.module.scss';

function SelfHostedLicenses() {
  const { licenseId } = useParams();
  const { user, error: userError } = useCurrentUser();
  const title = (
    <CardTitle
      title="cloud.self_hosted_licenses.title"
      subtitle="cloud.self_hosted_licenses.description"
      learnMoreLink={{ href: selfHostedLicenseGuideLink }}
    />
  );

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
              <>
                {/* Self-hosted license self-serve purchase is still in development. */}
                {isDevFeaturesEnabled && user && !userError ? (
                  // Keep a purchase local to its account, including in-flight Checkout requests.
                  <Purchase key={user.id} userId={user.id} title={title} />
                ) : (
                  title
                )}
                <List />
              </>
            )}
          </div>
        </OverlayScrollbar>
      </div>
    </AppBoundary>
  );
}

export default SelfHostedLicenses;
