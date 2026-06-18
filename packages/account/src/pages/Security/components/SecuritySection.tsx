import classNames from 'classnames';
import { type ReactNode } from 'react';

import { layoutClassNames } from '@ac/constants/layout';

import styles from './index.module.scss';

type Props = {
  readonly title: string;
  /** Optional content rendered between the section title and the card, e.g. an inline warning. */
  readonly notification?: ReactNode;
  readonly children: ReactNode;
};

const SecuritySection = ({ title, notification, children }: Props) => (
  <div className={classNames(styles.section, layoutClassNames.section)}>
    <div className={classNames(styles.sectionTitle, layoutClassNames.sectionTitle)}>{title}</div>
    {notification}
    <div className={classNames(styles.card, layoutClassNames.card)}>{children}</div>
  </div>
);

export default SecuritySection;
