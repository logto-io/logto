import React from 'react';

import useSocialSignInListener from '@/hooks/use-social-sign-in-listener';

import SignIn from '.';

const SocialCallback = () => {
  useSocialSignInListener();

  return <SignIn />;
};

export default SocialCallback;
