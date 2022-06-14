import React, { ReactNode } from 'react'
import Admonition from '@theme/Admonition';

type Props = {
  type: ReactNode;
};

const AppNote = ({ type }: Props) => {
  return (
    <Admonition type="note">
      本篇教程默认你已经在管理界面中成功创建了一个 {type} 应用。如果你还没有完成这一步操作，请参阅这篇教程，创建应用之后再继续。
    </Admonition>
  );
};

export default AppNote
