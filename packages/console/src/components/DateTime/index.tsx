import { Nullable } from '@silverhand/essentials';
import dayjs from 'dayjs';
import React from 'react';

type Props = {
  children: Nullable<string | number>;
};

const DateTime = ({ children }: Props) => {
  const date = dayjs(children);

  if (!children || !date.isValid()) {
    return <span>-</span>;
  }

  return <span>{date.format('YYYY/MM/DD')}</span>;
};

export default DateTime;
