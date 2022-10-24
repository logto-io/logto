import classNames from 'classnames';
import type { LegacyRef, ReactNode } from 'react';
import { Children, cloneElement, forwardRef, isValidElement } from 'react';

import type { Props as RadioProps } from './Radio';
import Radio from './Radio';
import * as styles from './index.module.scss';

type Props = {
  name: string;
  children: ReactNode;
  value?: string;
  type?: 'card' | 'plain';
  className?: string;
  onChange?: (value: string) => void;
};

const RadioGroup = (
  { name, children, value, className, onChange, type = 'plain' }: Props,
  reference?: LegacyRef<HTMLDivElement>
) => {
  return (
    <div ref={reference} className={classNames(styles.radioGroup, styles[type], className)}>
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
          type,
        });
      })}
    </div>
  );
};

export default forwardRef<HTMLDivElement, Props>(RadioGroup);
export { default as Radio } from './Radio';
