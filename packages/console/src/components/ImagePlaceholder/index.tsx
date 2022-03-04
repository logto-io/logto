import React from 'react';

import defaultPlaceholder from '@/assets/images/default-placeholder.svg';

import * as styles from './index.module.scss';

const ImagePlaceholder = () => {
  return <img src={defaultPlaceholder} className={styles.placeholder} />;
};

export default ImagePlaceholder;
