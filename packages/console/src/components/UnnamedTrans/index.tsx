import React from 'react';

import { translateUnnamed } from '@/utilities/translation';

type Props = {
  resource: Record<string, string>;
  className?: string;
};

const UnnamedTrans = ({ resource, className }: Props) => {
  const translation = translateUnnamed(resource);

  if (!translation) {
    return null;
  }

  return <span className={className}>{translation}</span>;
};

export default UnnamedTrans;
