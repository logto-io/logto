import { Outlet } from 'react-router-dom';

import * as styles from './index.module.scss';

const CloudPreview = () => (
  <div className={styles.cloudPreview}>
    <Outlet />
  </div>
);

export default CloudPreview;
