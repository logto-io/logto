import type { LocalePhrase } from '../../types.js';

import errors from './errors/index.js';
import translation from './translation/index.js';

const pt_br = {
  translation,
  errors,
} satisfies LocalePhrase;

export default Object.freeze(pt_br);
