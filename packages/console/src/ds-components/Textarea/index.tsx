import classNames from 'classnames';
import type { ForwardedRef, HTMLProps } from 'react';
import { forwardRef } from 'react';

import styles from './index.module.scss';

type Props = HTMLProps<HTMLTextAreaElement> & {
  readonly className?: string;
  readonly error?: string | boolean;
};

function Textarea(
  { className, error, ...rest }: Props,
  reference: ForwardedRef<HTMLTextAreaElement>
) {
  return (
    <div className={classNames(styles.container, Boolean(error) && styles.error, className)}>
      <textarea {...rest} ref={reference} />
    </div>
  );
}

export default forwardRef(Textarea);
