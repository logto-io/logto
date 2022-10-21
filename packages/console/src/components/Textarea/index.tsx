import classNames from 'classnames';
import { ForwardedRef, forwardRef, HTMLProps } from 'react';

import * as styles from './index.module.scss';

type Props = HTMLProps<HTMLTextAreaElement> & {
  className?: string;
};

const Textarea = ({ className, ...rest }: Props, reference: ForwardedRef<HTMLTextAreaElement>) => {
  return (
    <div className={classNames(styles.container, className)}>
      <textarea {...rest} ref={reference} />
    </div>
  );
};

export default forwardRef(Textarea);
