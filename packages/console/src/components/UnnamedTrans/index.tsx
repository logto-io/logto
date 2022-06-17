import React from 'react';

import { translateUnnamed } from '@/utilities/translation';

type Props = {
  resource: Record<string, string>;
  className?: string;
};

const UnnamedTrans = ({ resource, className }: Props) => (
  <span className={className}>{translateUnnamed(resource)}</span>
);

export default UnnamedTrans;
