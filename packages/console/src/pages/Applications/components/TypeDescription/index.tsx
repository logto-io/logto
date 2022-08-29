import * as styles from './index.module.scss';

type Props = {
  title: string;
  subtitle: string;
  description: string;
};

const TypeDescription = ({ title, subtitle, description }: Props) => {
  return (
    <>
      <div className={styles.title}>{title}</div>
      <div className={styles.subtitle}>{subtitle}</div>
      <div className={styles.description}>{description}</div>
    </>
  );
};

export default TypeDescription;
