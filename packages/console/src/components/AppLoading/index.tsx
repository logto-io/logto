import Logo from '@/assets/images/logo.svg?react';
import { Daisy as Spinner } from '@/ds-components/Spinner';

import styles from './index.module.scss';

function AppLoading() {
  return (
    <div className={styles.container}>
      <Logo />
      <Spinner />
    </div>
  );
}

export default AppLoading;
