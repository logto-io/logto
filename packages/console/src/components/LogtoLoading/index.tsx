import { I18nKey } from '@logto/phrases';
import React from 'react';
import { useTranslation } from 'react-i18next';

import highFive from '@/assets/images/high-five.svg';

import * as styles from './index.module.scss';

type Props = {
  message: I18nKey;
};

const LogtoLoading = ({ message }: Props) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <img src={highFive} alt="yeah" />
      <p>{t(message)}</p>
    </div>
  );
};

export default LogtoLoading;
