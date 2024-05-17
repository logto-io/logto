import classNames from 'classnames';
import { type PropsWithChildren } from 'react';

import FlexBox from '../FlexBox';

import * as styles from './index.module.scss';

/**
 * The section component with a gray background
 */
type Props = {
  readonly className?: string;
  readonly title: string;
  readonly description?: string;
};

function Section({ className, title, description, children }: PropsWithChildren<Props>) {
  return (
    <FlexBox type="column" className={classNames(styles.section, className)}>
      <div className={styles.title}>{title}</div>
      <div className={styles.description}>{description}</div>
      {children}
    </FlexBox>
  );
}

export default Section;
