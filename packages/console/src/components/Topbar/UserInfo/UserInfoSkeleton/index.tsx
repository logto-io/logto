import styles from './index.module.scss';

function UserInfoSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.image} />
    </div>
  );
}

export default UserInfoSkeleton;
