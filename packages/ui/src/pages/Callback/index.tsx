import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import useSocial from '@/hooks/use-social-connector';

type Props = {
  connector?: string;
};

const Callback = () => {
  const { connector } = useParams<Props>();
  const { signInWithSocial } = useSocial();

  useEffect(() => {
    signInWithSocial(connector);
  }, [signInWithSocial, connector]);

  return <div>{connector} loading...</div>;
};

export default Callback;
