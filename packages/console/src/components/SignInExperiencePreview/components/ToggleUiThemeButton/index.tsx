import { Theme } from '@logto/schemas';
import classNames from 'classnames';

import Moon from '@/assets/icons/moon.svg';
import Sun from '@/assets/icons/sun.svg';
import Button from '@/ds-components/Button';
import type { Props as ButtonProps } from '@/ds-components/Button';

import * as styles from './index.module.scss';

type Props = {
  readonly value: Theme;
  readonly onToggle: (value: Theme) => void;
  readonly className?: string;
  readonly iconClassName?: string;
  readonly size?: ButtonProps['size'];
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
