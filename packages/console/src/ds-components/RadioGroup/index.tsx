import type { Falsy, Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import type { JSXElementConstructor, Key, Ref } from 'react';
import { Children, cloneElement, forwardRef, isValidElement } from 'react';

import type { Props as RadioProps } from './Radio';
import Radio from './Radio';
import styles from './index.module.scss';

type RadioElement =
  | {
      type: JSXElementConstructor<RadioProps>;
      props: RadioProps;
      key: Nullable<Key>;
    }
  | Falsy;

type Props = {
  readonly name: string;
  readonly children: RadioElement | RadioElement[];
  readonly value?: string;
  readonly type?: 'card' | 'plain' | 'compact' | 'small';
  readonly className?: string;
  readonly onChange?: (value: string) => void;
};

function RadioGroup(
  { name, children, value, className, onChange, type = 'plain' }: Props,
  ref?: Ref<HTMLDivElement>
) {
  return (
    <div ref={ref} className={classNames(styles.radioGroup, styles[type], className)}>
      {Children.map(children, (child) => {
        if (!child || !isValidElement(child) || child.type !== Radio) {
          // As typescript still cannot restrict React children to specific component types, we need to alert the error in runtime.
          // Reference: https://github.com/microsoft/TypeScript/issues/21699
          console.error(
            'Invalid child type for RadioGroup:',
            child ? child.type : child,
            '. Expecting Radio components.'
          );

          // Do not render child if not a valid Radio component
          return null;
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
}

export default forwardRef<HTMLDivElement, Props>(RadioGroup);
export { default as Radio } from './Radio';
