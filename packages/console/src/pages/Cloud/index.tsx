import { Outlet } from 'react-router-dom';

import * as styles from './index.module.scss';

const Cloud = () => (
  <div className={styles.cloud}>
    <Outlet />
  </div>
);

export default Cloud;
