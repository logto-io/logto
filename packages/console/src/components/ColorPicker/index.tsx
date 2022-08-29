import { nanoid } from 'nanoid';
import { ChangeEventHandler, useState } from 'react';

import * as styles from './index.module.scss';

type Props = {
  value?: string;
  onChange?: (value: string) => void;
};

const ColorPicker = ({ onChange, value = '#000000' }: Props) => {
  const [id, setId] = useState(nanoid());

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange?.(event.target.value);
  };

  return (
    <div className={styles.container}>
      <input type="color" id={id} value={value} onChange={handleChange} />
      <label htmlFor={id}>{value.toUpperCase()}</label>
    </div>
  );
};
export default ColorPicker;
