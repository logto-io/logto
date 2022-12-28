import classNames from 'classnames';

import Card from '@/components/Card';
import * as formCardStyles from '@/components/FormCard/index.module.scss';
import Spacer from '@/components/Spacer';

import * as styles from './index.module.scss';

const DetailsSkeleton = () => (
  <div className={styles.container}>
    <div className={styles.header}>
      <div className={styles.icon} />
      <div className={styles.wrapper}>
        <div className={styles.title} />
        <div className={styles.tags} />
      </div>
      <Spacer />
      <div className={styles.button} />
    </div>
    <div className={styles.tabBar} />
    <Card className={classNames(formCardStyles.container, styles.content)}>
      <div className={classNames(formCardStyles.introduction, styles.introduction)}>
        <div className={styles.title} />
        <div className={styles.description}>
          {Array.from({ length: 2 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className={styles.text} />
          ))}
        </div>
      </div>
      <div className={classNames(formCardStyles.form, styles.form)}>
        {Array.from({ length: 4 }).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} className={styles.field} />
        ))}
      </div>
    </Card>
  </div>
);

export default DetailsSkeleton;
