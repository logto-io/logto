import React from 'react';

import * as styles from './index.module.scss';

export type Props = {
  logo: string;
  headline?: string;
};

const BrandingHeader = ({ logo, headline }: Props) => {
  return (
    <div className={styles.container}>
      <img className={styles.logo} alt="app logo" src={logo} />
      {headline && <div className={styles.headline}>{headline}</div>}
    </div>
  );
};

export default BrandingHeader;
