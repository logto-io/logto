import type { LocalePhrase } from '../../types.js';

import errors from './errors/index.js';
import translation from './translation/index.js';

const ja = {
  translation,
  errors,
} satisfies LocalePhrase;

export default Object.freeze(ja);
