import { FormCardSkeleton } from '@/components/FormCard';

import * as styles from './index.module.scss';

function Skeleton() {
  return (
    <div className={styles.container}>
      <FormCardSkeleton formFieldCount={1} />
      <FormCardSkeleton formFieldCount={1} />
    </div>
  );
}

export default Skeleton;
