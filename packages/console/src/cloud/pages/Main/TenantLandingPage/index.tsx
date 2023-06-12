import Topbar from '@/containers/AppContent/components/Topbar';

import TenantLandingPageContent from './TenantLandingPageContent';
import * as styles from './index.module.scss';

function TenantLandingPage() {
  return (
    <div className={styles.pageContainer}>
      <Topbar className={styles.topbar} />
      <TenantLandingPageContent className={styles.placeholder} />
    </div>
  );
}

export default TenantLandingPage;
