import React, { ReactNode } from 'react';
import Admonition from '@theme/Admonition';

type Props = {
  calling: ReactNode;
};

const SignInNote = ({ calling }: Props) => {
  return (
    <Admonition type="note">
      在调用 <code>{calling}</code> 之前，请首先确保已经在管理界面中正确 <a href="https://logto.io">配置 Redirect URI</a>
    </Admonition>
  );
};

export default SignInNote;
