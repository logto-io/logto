import classNames from 'classnames';
import { useRef, useState } from 'react';
import { ColorPicker as ColorPalette, useColor } from 'react-color-palette';

import { onKeyDownHandler } from '@/utils/a11y';

import Dropdown from '../Dropdown';

import styles from './index.module.scss';

type Props = {
  readonly name?: string;
  readonly value?: string;
  readonly onChange: (value: string) => void;
};

function ColorPicker({ name, onChange, value = '#000000' }: Props) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [color] = useColor(value);

  return (
    <div
      tabIndex={0}
      role="button"
      className={classNames(styles.container, isOpen && styles.highlight)}
      onClick={() => {
        setIsOpen(true);
      }}
      onKeyDown={onKeyDownHandler(() => {
        setIsOpen(true);
      })}
    >
      <input hidden readOnly name={name} value={value} />
      <span ref={anchorRef} className={styles.brick} style={{ backgroundColor: value }} />
      <span>{value.toUpperCase()}</span>
      <Dropdown
        anchorRef={anchorRef}
        isOpen={isOpen}
        horizontalAlign="start"
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <div className={styles.palette}>
          <ColorPalette
            color={color}
            onChange={({ hex }) => {
              onChange(hex);
            }}
          />
        </div>
      </Dropdown>
    </div>
  );
}

export default ColorPicker;
