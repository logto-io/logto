import { useParams } from 'react-router-dom';

import PageMeta from '@/components/PageMeta';
import Topbar from '@/components/Topbar';
import AppBoundary from '@/containers/AppBoundary';
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
            {licenseId ? <Details key={licenseId} id={licenseId} /> : <List />}
          </div>
        </OverlayScrollbar>
      </div>
    </AppBoundary>
  );
}

export default SelfHostedLicenses;
