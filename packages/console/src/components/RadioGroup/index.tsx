import React, { Children, cloneElement, isValidElement, ReactNode } from 'react';

import Radio, { Props as RadioProps } from './Radio';
import * as styles from './index.module.scss';

type Props = {
  name: string;
  children: ReactNode;
  value: string;
  onChange?: (value: string) => void;
};

const RadioGroup = ({ name, children, value, onChange }: Props) => {
  return (
    <div className={styles.radioGroup} tabIndex={0}>
      {Children.map(children, (child) => {
        if (!isValidElement(child) || child.type !== Radio) {
          return child;
        }

        return cloneElement<RadioProps>(child, {
          name,
          isChecked: value === child.props.value,
          onClick: () => {
            onChange?.(child.props.value);
          },
        });
      })}
    </div>
  );
};

export default RadioGroup;
export { default as Radio } from './Radio';
