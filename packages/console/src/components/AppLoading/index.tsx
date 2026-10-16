import Logo from '@/assets/images/logo.svg?react';
import MeshxMark from '@/assets/images/meshx-mark.svg?react';

import styles from './index.module.scss';

function AppLoading() {
  return (
    <div className={styles.container}>
      <Logo />
      <MeshxMark className={styles.mark} aria-label="Loading" role="img" />
    </div>
  );
}

export default AppLoading;
