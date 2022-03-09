import React, { Children, cloneElement, forwardRef, isValidElement, ReactNode } from 'react';

import Radio, { Props as RadioProps } from './Radio';
import * as styles from './index.module.scss';

type Props = {
  name: string;
  children: ReactNode;
  value: string;
  // https://github.com/yannickcr/eslint-plugin-react/issues/2856
  // eslint-disable-next-line react/require-default-props
  onChange?: (value: string) => void;
};

const RadioGroup = forwardRef<HTMLDivElement, Props>(
  ({ name, children, value, onChange }: Props, reference) => {
    return (
      <div ref={reference} className={styles.radioGroup}>
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
            tabIndex: 0,
          });
        })}
      </div>
    );
  }
);

export default RadioGroup;
export { default as Radio } from './Radio';
