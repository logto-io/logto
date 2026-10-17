import CloudLogo from '@/assets/images/cloud-logo.svg?react';
import MeshxMark from '@/assets/images/meshx-mark.svg?react';

import styles from './index.module.scss';

// The same lockup as the console topbar: the red mark, then the wordmark.
function Topbar() {
  return (
    <div className={styles.topbar}>
      <div className={styles.brand}>
        <MeshxMark className={styles.mark} />
        <CloudLogo className={styles.logo} />
      </div>
    </div>
  );
}

export default Topbar;
