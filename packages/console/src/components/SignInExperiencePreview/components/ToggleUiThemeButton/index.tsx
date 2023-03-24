import { Theme } from '@logto/schemas';
import classNames from 'classnames';

import Moon from '@/assets/images/moon.svg';
import Sun from '@/assets/images/sun.svg';

import type { Props as ButtonProps } from '../../../Button';
import Button from '../../../Button';

import * as styles from './index.module.scss';

type Props = {
  value: Theme;
  onToggle: (value: Theme) => void;
  className?: string;
  iconClassName?: string;
  size?: ButtonProps['size'];
};

function ToggleUiThemeButton({
  value,
  onToggle,
  className,
  iconClassName,
  size = 'medium',
}: Props) {
  const ThemeIcon = value === Theme.Light ? Sun : Moon;

  return (
    <div className={classNames(styles.container, styles[size])}>
      <Button
        size={size}
        className={classNames(styles.button, className)}
        icon={<ThemeIcon className={classNames(styles.icon, iconClassName)} />}
        onClick={() => {
          onToggle(value === Theme.Light ? Theme.Dark : Theme.Light);
        }}
      />
    </div>
  );
}

export default ToggleUiThemeButton;
