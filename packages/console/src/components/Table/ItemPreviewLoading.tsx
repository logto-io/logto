import React from 'react';

import * as styles from './ItemPreviewLoading.module.scss';

const ItemPreviewLoading = () => (
  <div className={styles.loading}>
    <div className={styles.avatar} />
    <div className={styles.content}>
      <div className={styles.title} />
      <div className={styles.subTitle} />
    </div>
  </div>
);

export default ItemPreviewLoading;
