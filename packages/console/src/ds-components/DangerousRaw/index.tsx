import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

function DangerousRaw({ children }: Props) {
  return <span>{children}</span>;
}

export default DangerousRaw;
