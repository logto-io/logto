import classNames from 'classnames';

import styles from './index.module.scss';

type Props = {
  readonly isChecked: boolean;
  readonly isDisabled?: boolean;
  readonly onChange: (checked: boolean) => void;
};

const ToggleSwitch = ({ isChecked, isDisabled, onChange }: Props) => {
  return (
    <label className={classNames(styles.switch, isDisabled && styles.disabled)}>
      <input
        aria-label="Toggle switch"
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
