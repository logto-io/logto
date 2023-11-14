import classNames from 'classnames';

import UserIcon from '@/assets/icons/user.svg';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  name: string;
  hasIcon?: boolean;
  variant?: 'blue' | 'pink';
  size?: 'default' | 'small';
};

function User({ className, name, hasIcon = true, variant, size }: Props) {
  return (
    <div
      className={classNames(
        styles.user,
        variant && styles[variant],
        size && styles[size],
        className
      )}
    >
      {hasIcon && <UserIcon className={styles.avatar} />}
      <div className={styles.name}>{name}</div>
    </div>
  );
}

export default User;
