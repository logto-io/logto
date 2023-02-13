import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import { onKeyDownHandler } from '@/utilities/a11y';

import type { Option } from '../types';
import * as styles from './index.module.scss';

type Props = {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
};

const MultiCardSelector = ({ options, value: selectedValues, onChange }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const onToggle = (value: string) => {
    onChange(
      selectedValues.includes(value)
        ? selectedValues.filter((selected) => selected !== value)
        : [...selectedValues, value]
    );
  };

  return (
    <div className={styles.selector}>
      {options.map(({ icon, title, value }) => (
        <div
          key={value}
          role="button"
          tabIndex={0}
          className={classNames(styles.option, selectedValues.includes(value) && styles.selected)}
          onClick={() => {
            onToggle(value);
          }}
          onKeyDown={onKeyDownHandler(() => {
            onToggle(value);
          })}
        >
          {icon && <span className={styles.icon}>{icon}</span>}
          {t(title)}
        </div>
      ))}
    </div>
  );
};

export default MultiCardSelector;
