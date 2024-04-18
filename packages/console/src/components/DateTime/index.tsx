import type { Nullable } from '@silverhand/essentials';
import { isValid } from 'date-fns';

type Props = {
  readonly children: Nullable<string | number>;
};

function DateTime({ children }: Props) {
  const date = children && new Date(children);

  if (!date || !isValid(date)) {
    return <span>-</span>;
  }

  return <span>{date.toLocaleDateString()}</span>;
}

export default DateTime;
