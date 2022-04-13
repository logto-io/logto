import classNames from 'classnames';
import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  LegacyRef,
  ReactNode,
} from 'react';

import Radio, { Props as RadioProps } from './Radio';
import * as styles from './index.module.scss';

type Props = {
  name: string;
  children: ReactNode;
  value?: string;
  className?: string;
  onChange?: (value: string) => void;
};

const RadioGroup = (
  { name, children, value, className, onChange }: Props,
  reference?: LegacyRef<HTMLDivElement>
) => {
  return (
    <div ref={reference} className={classNames(styles.radioGroup, className)}>
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
};

export default forwardRef<HTMLDivElement, Props>(RadioGroup);
export { default as Radio } from './Radio';
