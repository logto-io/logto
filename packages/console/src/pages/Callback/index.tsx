import { useHandleSignInCallback } from '@logto/react';
import React from 'react';

import LogtoLoading from '@/components/LogtoLoading';
import { getBasename } from '@/utilities/app';

const Callback = () => {
  useHandleSignInCallback(getBasename());

  return <LogtoLoading message="general.redirecting" />;
};

export default Callback;
