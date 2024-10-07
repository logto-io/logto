import classNames from 'classnames';

import Failed from '@/assets/icons/failed.svg?react';
import Success from '@/assets/icons/success.svg?react';

import styles from './index.module.scss';
import useFeaturedSkuContent from './use-featured-sku-content';

type Props = {
  readonly skuId: string;
};

function FeaturedSkuContent({ skuId }: Props) {
  const contentData = useFeaturedSkuContent(skuId);

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

export default FeaturedSkuContent;
