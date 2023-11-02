import PermissionsCard from '../PermissionsCard';
import RolesCard from '../RolesCard';

import * as styles from './index.module.scss';

export default function Settings() {
  return (
    <div className={styles.content}>
      <PermissionsCard />
      <RolesCard />
    </div>
  );
}
