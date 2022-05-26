import React from 'react';

import useSocialSignInListener from '@/hooks/use-social-signin-listener';

import SocialSignInList from '../SocialSignInList';

export const defaultSize = 3;

type Props = {
  className?: string;
};

const PrimarySocialSignIn = ({ className }: Props) => {
  useSocialSignInListener();

  return <SocialSignInList className={className} />;
};

export default PrimarySocialSignIn;
