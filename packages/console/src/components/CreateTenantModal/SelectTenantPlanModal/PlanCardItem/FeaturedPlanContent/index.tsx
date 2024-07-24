import classNames from 'classnames';

import Failed from '@/assets/icons/failed.svg?react';
import Success from '@/assets/icons/success.svg?react';

import styles from './index.module.scss';
import useFeaturedPlanContent from './use-featured-plan-content';

type Props = {
  readonly planId: string;
};

function FeaturedPlanContent({ planId }: Props) {
  const contentData = useFeaturedPlanContent(planId);

  return (
    <ul className={styles.list}>
      {contentData.map(({ title, isAvailable }) => {
        return (
          <li key={title}>
            {isAvailable ? (
              <Success className={classNames(styles.icon, styles.success)} />
            ) : (
              <Failed className={classNames(styles.icon, styles.failed)} />
            )}
            {title}
          </li>
        );
      })}
    </ul>
  );
}

export default FeaturedPlanContent;
