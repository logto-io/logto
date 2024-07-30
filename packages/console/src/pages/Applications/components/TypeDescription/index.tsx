import { type ApplicationType } from '@logto/schemas';
import classNames from 'classnames';

import ApplicationIcon from '@/components/ApplicationIcon';

import styles from './index.module.scss';

type Props = {
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly type: ApplicationType;
  readonly size?: 'large' | 'small';
};

function TypeDescription({ title, subtitle, description, type, size = 'large' }: Props) {
  return (
    <div className={classNames(styles.container, styles[size])}>
      <ApplicationIcon type={type} />
      <div className={styles.title}>{title}</div>
      <div className={styles.subtitle}>{subtitle}</div>
      <div className={styles.description}>{description}</div>
    </div>
  );
}

export default TypeDescription;
