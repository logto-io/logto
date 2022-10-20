import { ApplicationType } from '@logto/schemas';

import ApplicationIcon from '@/components/ApplicationIcon';

import * as styles from './index.module.scss';

type Props = {
  title: string;
  subtitle: string;
  description: string;
  type: ApplicationType;
};

const TypeDescription = ({ title, subtitle, description, type }: Props) => {
  return (
    <>
      <ApplicationIcon type={type} />
      <div className={styles.title}>{title}</div>
      <div className={styles.subtitle}>{subtitle}</div>
      <div className={styles.description}>{description}</div>
    </>
  );
};

export default TypeDescription;
