import type { ReactNode } from 'react';

import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
};

const PageLayout = ({ children }: Props) => <div className={styles.page}>{children}</div>;

export const HeadLine = ({ children }: Props) => <div className={styles.headline}>{children}</div>;

export const Content = ({ children }: Props) => <div className={styles.content}>{children}</div>;

export default PageLayout;
