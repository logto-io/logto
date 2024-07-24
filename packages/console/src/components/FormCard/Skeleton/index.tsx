import FormFieldSkeleton from '@/ds-components/FormField/Skeleton';

import FormCardLayout from '../FormCardLayout';

import styles from './index.module.scss';

type Props = {
  readonly formFieldCount?: number;
};

function Skeleton({ formFieldCount = 4 }: Props) {
  return (
    <FormCardLayout
      introduction={
        <>
          <div className={styles.title} />
          <div>
            {Array.from({ length: 2 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={index} className={styles.text} />
            ))}
          </div>
        </>
      }
    >
      <FormFieldSkeleton formFieldCount={formFieldCount} />
    </FormCardLayout>
  );
}

export default Skeleton;
