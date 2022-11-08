import type { Nullable } from '@silverhand/essentials';
import { isValid } from 'date-fns';

type Props = {
  children: Nullable<string | number>;
};

const DateTime = ({ children }: Props) => {
  const date = children && new Date(children);

  if (!date || !isValid(date)) {
    return <span>-</span>;
  }

  return <span>{date.toLocaleDateString()}</span>;
};

export default DateTime;
