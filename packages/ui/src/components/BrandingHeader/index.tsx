import React, { useState, useCallback } from 'react';

import * as styles from './index.module.scss';

export type Props = {
  logo: string;
  context?: string;
};

const BrandingHeader = ({ logo, context }: Props) => {
  const [imgError, setImgError] = useState(false);

  // TODO: fallback to logto
  const hideLogo = useCallback(() => {
    setImgError(true);
  }, [setImgError]);

  return (
    <div className={styles.container}>
      {!imgError && <img className={styles.logo} alt="app logo" src={logo} onError={hideLogo} />}
      {context && <div className={styles.context}>{context}</div>}
    </div>
  );
};

export default BrandingHeader;
