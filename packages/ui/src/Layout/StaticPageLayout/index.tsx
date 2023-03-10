import * as styles from './index.module.scss';

type Props = {
  children: React.ReactNode;
};

const StaticPageLayout = ({ children }: Props) => {
  return <div className={styles.wrapper}>{children}</div>;
};

export default StaticPageLayout;
