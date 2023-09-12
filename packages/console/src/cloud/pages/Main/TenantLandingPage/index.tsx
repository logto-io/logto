import Topbar from '@/components/Topbar';

import TenantLandingPageContent from './TenantLandingPageContent';
import * as styles from './index.module.scss';

function TenantLandingPage() {
  return (
    <div className={styles.pageContainer}>
      <Topbar />
      <TenantLandingPageContent className={styles.placeholder} />
    </div>
  );
}

export default TenantLandingPage;
