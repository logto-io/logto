import classNames from 'classnames';

import Moon from '@/assets/images/moon.svg';
import Sun from '@/assets/images/sun.svg';

import type { Props as ButtonProps } from '../../../Button';
import Button from '../../../Button';
import { UiTheme } from '../../types';
import * as styles from './index.module.scss';

type Props = {
  value: UiTheme;
  onToggle: (value: UiTheme) => void;
  className?: string;
  iconClassName?: string;
  size?: ButtonProps['size'];
};

const ToggleUiThemeButton = ({
  value,
  onToggle,
  className,
  iconClassName,
  size = 'medium',
}: Props) => {
  const ThemeIcon = value === UiTheme.Light ? Sun : Moon;

  return (
    <div className={classNames(styles.container, styles[size])}>
      <Button
        size={size}
        className={classNames(styles.button, className)}
        icon={<ThemeIcon className={classNames(styles.icon, iconClassName)} />}
        onClick={() => {
          onToggle(value === UiTheme.Light ? UiTheme.Dark : UiTheme.Light);
        }}
      />
    </div>
  );
};

export default ToggleUiThemeButton;
