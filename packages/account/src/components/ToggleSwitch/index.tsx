import classNames from 'classnames';

import styles from './index.module.scss';

type Props = {
  readonly isChecked: boolean;
  readonly isDisabled?: boolean;
  readonly ariaLabel?: string;
  readonly onChange: (checked: boolean) => void;
};

const ToggleSwitch = ({ isChecked, isDisabled, ariaLabel, onChange }: Props) => {
  return (
    <label className={classNames(styles.switch, isDisabled && styles.disabled)}>
      <input
        aria-label={ariaLabel ?? 'Toggle switch'}
        type="checkbox"
        checked={isChecked}
        disabled={isDisabled}
        onChange={(event) => {
          onChange(event.target.checked);
        }}
      />
      <span className={styles.slider} />
    </label>
  );
};

export default ToggleSwitch;
