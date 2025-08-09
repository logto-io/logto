import classNames from 'classnames';

import Checkbox, { type Props as CheckboxProps } from '@/components/Checkbox';
import { onKeyDownHandler } from '@/utils/a11y';

import styles from './index.module.scss';

type Props = Omit<CheckboxProps, 'onChange'> & {
  readonly onChange: (checked: boolean) => void;
};

const CheckboxField = ({ className, checked, title, onChange, ...rest }: Props) => {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      className={classNames(styles.checkboxContainer, className)}
      onClick={() => {
        onChange(!checked);
      }}
      onKeyDown={onKeyDownHandler({
        Escape: () => {
          onChange(false);
        },
        Enter: () => {
          onChange(!checked);
        },
        ' ': () => {
          onChange(!checked);
        },
      })}
    >
      <Checkbox {...rest} checked={checked} />
      <span>{title}</span>
    </div>
  );
};

export default CheckboxField;
