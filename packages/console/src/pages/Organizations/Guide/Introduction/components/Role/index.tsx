import classNames from 'classnames';

import FlexBox from '../FlexBox';
import Permission from '../Permission';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  label: string;
  permissions?: string[];
  size?: 'default' | 'small';
};

function Role({ className, label, permissions, size = 'default' }: Props) {
  return (
    <FlexBox type="column" gap={10} className={classNames(styles.role, styles[size], className)}>
      <div className={styles.label}>{label}</div>
      {!!permissions?.length && (
        <FlexBox type="column" gap={10} className={styles.permissions}>
          {permissions.map((permission) => (
            <Permission key={permission} name={permission} />
          ))}
        </FlexBox>
      )}
    </FlexBox>
  );
}

export default Role;
