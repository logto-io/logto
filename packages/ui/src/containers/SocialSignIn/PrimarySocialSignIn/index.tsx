import React from 'react';

import useNativeMessageListener from '@/hooks/use-native-message-listener';

import SocialSignInList from '../SocialSignInList';

export const defaultSize = 3;

type Props = {
  className?: string;
};

const PrimarySocialSignIn = ({ className }: Props) => {
  useNativeMessageListener();

  return <SocialSignInList className={className} />;
};

export default PrimarySocialSignIn;
