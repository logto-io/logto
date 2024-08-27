import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useLayoutEffect, useState } from 'react';

import { Tooltip } from '@/ds-components/Tip';
import { onKeyDownHandler } from '@/utils/a11y';

import styles from './index.module.scss';

type Props = {
  /* eslint-disable react/boolean-prop-naming */
  readonly checked?: boolean;
  readonly disabled?: boolean;
  readonly indeterminate?: boolean;
  /* eslint-enable react/boolean-prop-naming */
  readonly onChange: (value: boolean) => void;
  readonly label?: ReactNode;
  readonly className?: string;
  readonly tooltip?: ReactNode;
};

function Checkbox({
  checked,
  disabled = false,
  indeterminate,
  onChange,
  label,
  className,
  tooltip,
}: Props) {
  const [isIndeterminate, setIsIndeterminate] = useState(indeterminate);

  useLayoutEffect(() => {
    setIsIndeterminate(indeterminate);
  }, [indeterminate]);

  const handleChange = () => {
    if (disabled) {
      return;
    }

    if (isIndeterminate) {
      onChange(false);
    }

    setIsIndeterminate(false);
    onChange(!checked);
  };

  return (
    <div className={classNames(styles.checkbox, disabled && styles.disabled, className)}>
      <div
        aria-checked={checked}
        className={styles.wrapper}
        role="checkbox"
        tabIndex={0}
        onClick={handleChange}
        onKeyDown={onKeyDownHandler(handleChange)}
      >
        <Tooltip horizontalAlign="start" content={tooltip} anchorClassName={styles.tooltipAnchor}>
          <svg
            className={classNames(
              styles.icon,
              (Boolean(checked) || isIndeterminate) && styles.checked,
              disabled && styles.disabled
            )}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              className={styles.background}
              x="1.66663"
              y="1.6665"
              width="16.6667"
              height="16.6667"
              rx="4"
            />
            {checked && !isIndeterminate && (
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.31476 13.858L5.13295 10.441C4.95568 10.253 4.95568 9.947 5.13295 9.757L5.77568 9.074C5.95295 8.886 6.24113 8.886 6.4184 9.074L8.63657 11.466L13.5811 6.141C13.7584 5.953 14.0465 5.953 14.2238 6.141L14.8665 6.825C15.0438 7.013 15.0438 7.32 14.8665 7.507L8.95748 13.858C8.78021 14.046 8.49203 14.046 8.31476 13.858Z"
                fill="white"
              />
            )}
            {isIndeterminate && (
              <path
                d="M5 9.37516C5 9.14504 5.1599 8.9585 5.35714 8.9585H14.6429C14.8401 8.9585 15 9.14504 15 9.37516V10.6252C15 10.8553 14.8401 11.0418 14.6429 11.0418H5.35714C5.1599 11.0418 5 10.8553 5 10.6252V9.37516Z"
                fill="white"
              />
            )}
            {!checked && !isIndeterminate && (
              <path
                className={styles.border}
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.2469 3.20971H4.75305C3.90076 3.20971 3.20984 3.90063 3.20984 4.75293V15.2467C3.20984 16.099 3.90076 16.79 4.75305 16.79H15.2469C16.0992 16.79 16.7901 16.099 16.7901 15.2467V4.75292C16.7901 3.90063 16.0992 3.20971 15.2469 3.20971ZM4.75305 1.6665C3.04846 1.6665 1.66663 3.04834 1.66663 4.75293V15.2467C1.66663 16.9513 3.04847 18.3332 4.75305 18.3332H15.2469C16.9515 18.3332 18.3333 16.9513 18.3333 15.2467V4.75292C18.3333 3.04834 16.9515 1.6665 15.2469 1.6665H4.75305Z"
              />
            )}
          </svg>
        </Tooltip>
        {label && <span className={styles.label}>{label}</span>}
      </div>
    </div>
  );
}

export default Checkbox;
