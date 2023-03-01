import { AppearanceMode } from '@logto/schemas';
import classNames from 'classnames';

import Moon from '@/assets/images/moon.svg';
import Sun from '@/assets/images/sun.svg';

import type { Props as ButtonProps } from '../Button';
import Button from '../Button';
import * as styles from './index.module.scss';

type Mode = Omit<AppearanceMode, AppearanceMode.SyncWithSystem>;

type Props = {
  value: Mode;
  onToggle: (value: Mode) => void;
  className?: string;
  iconClassName?: string;
  size?: ButtonProps['size'];
};

const ToggleThemeButton = ({
  value,
  onToggle,
  className,
  iconClassName,
  size = 'medium',
}: Props) => {
  const ThemeIcon = value === AppearanceMode.LightMode ? Sun : Moon;

  return (
    <div className={classNames(styles.container, styles[size])}>
      <Button
        size={size}
        className={classNames(styles.button, className)}
        icon={<ThemeIcon className={classNames(styles.icon, iconClassName)} />}
        onClick={() => {
          onToggle(
            value === AppearanceMode.LightMode ? AppearanceMode.DarkMode : AppearanceMode.LightMode
          );
        }}
      />
    </div>
  );
};

export default ToggleThemeButton;
