import CloudLogo from '@/assets/images/cloud-logo.svg';

import * as styles from './index.module.scss';

const Topbar = () => (
  <div className={styles.topbar}>
    <CloudLogo className={styles.logo} />
  </div>
);

export default Topbar;
