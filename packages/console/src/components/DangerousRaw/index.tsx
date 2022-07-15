import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const DangerousRaw = ({ children }: Props) => <span>{children}</span>;

export default DangerousRaw;
