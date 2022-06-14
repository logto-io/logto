import React, { ReactNode } from 'react'
import Admonition from '@theme/Admonition';

type Props = {
  type: ReactNode;
};

const AppNote = ({ type }: Props) => {
  return (
    <Admonition type="note">
      This tutorial assumes you have created a {type} Application in Admin Console. If you are not ready, read this one before continuing.
    </Admonition>
  );
};

export default AppNote
