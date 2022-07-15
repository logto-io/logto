import * as styles from './index.module.scss';

const UserInfoSkeleton = () => (
  <div className={styles.container}>
    <div className={styles.image} />
    <div className={styles.name} />
  </div>
);

export default UserInfoSkeleton;
