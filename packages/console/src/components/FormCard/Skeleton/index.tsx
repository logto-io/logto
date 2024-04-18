import FormCardLayout from '../FormCardLayout';

import * as styles from './index.module.scss';

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
      {Array.from({ length: formFieldCount }).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} className={styles.field} />
      ))}
    </FormCardLayout>
  );
}

export default Skeleton;
