import { type DeepPartial } from '@silverhand/essentials';

import type { LocalePhrase } from '../../types.js';

import errors from './errors/index.js';
import translation from './translation/index.js';

const pl_pl = {
  translation,
  errors,
} satisfies DeepPartial<LocalePhrase>;

export default Object.freeze(pl_pl);
