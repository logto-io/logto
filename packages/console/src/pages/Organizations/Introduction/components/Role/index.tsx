import classNames from 'classnames';

import Tooltip from '@/ds-components/Tip/Tooltip';

import FlexBox from '../FlexBox';
import Permission from '../Permission';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly label: string;
  readonly permissions?: string[];
  readonly tooltip?: string;
  readonly size?: 'default' | 'small';
  readonly isActive?: boolean;
  readonly onMouseOver?: () => void;
  readonly onMouseOut?: () => void;
};

function Role({
  className,
  label,
  permissions,
  tooltip,
  size = 'default',
  isActive = true,
  onMouseOver,
  onMouseOut,
}: Props) {
  return (
    <Tooltip content={tooltip}>
      <FlexBox
        type="column"
        gap={10}
        className={classNames(
          styles.role,
          styles[size],
          isActive && styles.active,
          tooltip && styles.interactive,
          className
        )}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
      >
        <div className={styles.label}>{label}</div>
        {!!permissions?.length && (
          <FlexBox type="column" gap={10} className={styles.permissions}>
            {permissions.map((permission) => (
              <Permission key={permission} name={permission} />
            ))}
          </FlexBox>
        )}
      </FlexBox>
    </Tooltip>
  );
}

export default Role;
