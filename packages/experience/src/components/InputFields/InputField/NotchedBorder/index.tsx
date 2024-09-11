import classNames from 'classnames';

import styles from './index.module.scss';

type Props = {
  readonly label: string;
  readonly isActive: boolean;
  readonly isDanger: boolean;
  readonly isFocused: boolean;
};

/**
 * NotchedBorder Component
 *
 * This component creates a customizable border with a notch for labels in form inputs.
 * It enhances the visual appearance and accessibility of input fields by providing
 * a floating label effect and customizable border/outline styles.
 *
 * Key implementation details:
 * 1. Uses two fieldset elements:
 *    - The first creates the main border effect.
 *    - The second creates a separate outline effect, avoiding gaps between the built-in outline and border.
 * 2. Utilizes the fieldset's legend for the label, allowing it to overlap the border:
 *    - This creates a "floating" label effect.
 *    - The legend's background becomes transparent, preventing it from blocking the background.
 *
 */
const NotchedBorder = ({ label, isActive, isDanger, isFocused }: Props) => {
  return (
    <div
      className={classNames(
        styles.container,
        isDanger && styles.danger,
        isActive && styles.active,
        isFocused && styles.focused,
        !label && styles.noLabel
      )}
    >
      <fieldset className={styles.border}>
        <legend>
          <span>{label}</span>
        </legend>
      </fieldset>
      <fieldset className={styles.outline}>
        <legend>
          <span>{label}</span>
        </legend>
      </fieldset>
      {Boolean(label) && <label className={styles.label}>{label}</label>}
    </div>
  );
};

export default NotchedBorder;
