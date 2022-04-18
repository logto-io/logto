import React from 'react';
import { useParams } from 'react-router-dom';

import useSocial from '@/hooks/use-social';

import * as styles from './index.module.scss';

type Props = {
  connector?: string;
};

const Callback = () => {
  const { connector } = useParams<Props>();
  useSocial();

  // TODO: load connector configs from context experience settings

  return <div className={styles.container}>{connector} loading...</div>;
};

export default Callback;
