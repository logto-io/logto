import type { ApplicationType } from '@logto/schemas';
import classNames from 'classnames';

import ApplicationIcon from '@/components/ApplicationIcon';
import ProTag from '@/components/ProTag';

import * as styles from './index.module.scss';

type Props = {
  title: string;
  subtitle: string;
  description: string;
  type: ApplicationType;
  size?: 'large' | 'small';
  hasProTag?: boolean;
};

function TypeDescription({
  title,
  subtitle,
  description,
  type,
  size = 'large',
  hasProTag = false,
}: Props) {
  return (
    <div className={classNames(styles.container, styles[size])}>
      <ApplicationIcon type={type} />
      <div className={styles.title}>{title}</div>
      <div className={styles.subtitle}>{subtitle}</div>
      <div className={styles.description}>{description}</div>
      {hasProTag && (
        <div className={styles.proTag}>
          <ProTag isVisibleInProdTenant />
        </div>
      )}
    </div>
  );
}

export default TypeDescription;
