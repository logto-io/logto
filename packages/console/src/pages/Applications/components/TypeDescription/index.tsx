import React from 'react';

import * as styles from './index.module.scss';

type Props = {
  subtitle: string;
  description: string;
};

const TypeDescription = ({ subtitle, description }: Props) => {
  return (
    <>
      <div className={styles.subtitle}>{subtitle}</div>
      <div className={styles.description}>{description}</div>
    </>
  );
};

export default TypeDescription;
