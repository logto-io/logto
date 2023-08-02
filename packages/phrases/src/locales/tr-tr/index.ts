import type { LocalePhrase } from '../../types.js';

import errors from './errors/index.js';
import translation from './translation/index.js';

const tr_tr = {
  translation,
  errors,
} satisfies LocalePhrase;

export default Object.freeze(tr_tr);
