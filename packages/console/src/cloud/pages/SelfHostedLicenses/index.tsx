import { useParams } from 'react-router-dom';

import PageMeta from '@/components/PageMeta';
import Topbar from '@/components/Topbar';
import { selfHostedLicenseGuideLink } from '@/consts/external-links';
import AppBoundary from '@/containers/AppBoundary';
import CardTitle from '@/ds-components/CardTitle';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';

import Details from './Details';
import List from './List';
import styles from './index.module.scss';

function SelfHostedLicenses() {
  const { licenseId } = useParams();

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
                <CardTitle
                  title="cloud.self_hosted_licenses.title"
                  subtitle="cloud.self_hosted_licenses.description"
                  learnMoreLink={{ href: selfHostedLicenseGuideLink }}
                />
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
