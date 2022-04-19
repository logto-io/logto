import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import useSocial from '@/hooks/use-social';

import * as styles from './index.module.scss';

type Props = {
  connector?: string;
};

const Callback = () => {
  const { connector } = useParams<Props>();
  const { socialCallbackHandler } = useSocial();

  // SocialSignIn Callback Handler
  useEffect(() => {
    if (connector) {
      socialCallbackHandler(connector);
    }
  }, [connector, socialCallbackHandler]);

  return <div className={styles.container}>{connector} loading...</div>;
};

export default Callback;
