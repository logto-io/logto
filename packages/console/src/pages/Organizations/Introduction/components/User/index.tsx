import classNames from 'classnames';

import UserIcon from '@/assets/icons/user.svg';
import Tooltip from '@/ds-components/Tip/Tooltip';

import * as styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly name: string;
  readonly hasIcon?: boolean;
  readonly variant?: 'blue' | 'pink';
  readonly size?: 'default' | 'small';
  readonly tooltip?: string;
  readonly isActive?: boolean;
  readonly onMouseOver?: () => void;
  readonly onMouseOut?: () => void;
};

function User({
  className,
  name,
  hasIcon = true,
  variant,
  size,
  tooltip,
  isActive = true,
  onMouseOver,
  onMouseOut,
}: Props) {
  return (
    <Tooltip content={tooltip}>
      <div
        className={classNames(
          styles.user,
          variant && styles[variant],
          size && styles[size],
          isActive && styles.active,
          tooltip && styles.interactive,
          className
        )}
        onFocus={onMouseOver}
        onBlur={onMouseOut}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
      >
        {hasIcon && <UserIcon className={styles.avatar} />}
        <div className={styles.name}>{name}</div>
      </div>
    </Tooltip>
  );
}

export default User;
