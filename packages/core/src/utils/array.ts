import type { Falsy } from '@silverhand/essentials';
import { notFalsy } from '@silverhand/essentials';

export const conditionalArray = <T>(...exp: Array<T | Falsy>): T[] =>
  exp.filter((value): value is Exclude<T, Falsy> => notFalsy(value));
