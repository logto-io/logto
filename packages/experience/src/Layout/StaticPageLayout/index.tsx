import styles from './index.module.scss';

type Props = {
  readonly children: React.ReactNode;
};

const StaticPageLayout = ({ children }: Props) => {
  return <div className={styles.wrapper}>{children}</div>;
};

export default StaticPageLayout;
