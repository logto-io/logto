import React from 'react';

import defaultPlaceholder from '@/assets/images/default-placeholder.svg';

import * as styles from './index.module.scss';

type Props = {
  size?: number;
  borderRadius?: number;
};

const ImagePlaceholder = ({ size = 50, borderRadius = 8 }: Props) => {
  return (
    <div className={styles.container} style={{ width: size, height: size, borderRadius }}>
      <img src={defaultPlaceholder} />
    </div>
  );
};

export default ImagePlaceholder;
