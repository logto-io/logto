import React from 'react';
import { useTranslation } from 'react-i18next';

import defaultPlaceholder from '@/assets/images/default-placeholder.svg';

import * as styles from './index.module.scss';

type Props = {
  size?: number;
  borderRadius?: number;
};

const ImagePlaceholder = ({ size = 40, borderRadius = 8 }: Props) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container} style={{ width: size, height: size, borderRadius }}>
      <img
        alt={t('general.placeholder')}
        src={defaultPlaceholder}
        style={{ width: size, height: size }}
      />
    </div>
  );
};

export default ImagePlaceholder;
