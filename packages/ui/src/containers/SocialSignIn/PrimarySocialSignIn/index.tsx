import React from 'react';

import SocialSignInList from '../SocialSignInList';

export const defaultSize = 3;

type Props = {
  className?: string;
};

const PrimarySocialSignIn = ({ className }: Props) => {
  return <SocialSignInList className={className} />;
};

export default PrimarySocialSignIn;
