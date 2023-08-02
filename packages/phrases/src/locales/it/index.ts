import type { LocalePhrase } from '../../types.js';

import errors from './errors/index.js';
import translation from './translation/index.js';

const it = {
  translation,
  errors,
} satisfies LocalePhrase;

export default Object.freeze(it);
