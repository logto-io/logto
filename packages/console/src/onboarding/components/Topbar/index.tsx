import CloudLogo from '@/assets/images/cloud-logo.svg';

import * as styles from './index.module.scss';

function Topbar() {
  return (
    <div className={styles.topbar}>
      <CloudLogo className={styles.logo} />
    </div>
  );
}

export default Topbar;
