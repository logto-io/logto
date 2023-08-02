import type { LocalePhrase } from '../../types.js';

import errors from './errors/index.js';
import translation from './translation/index.js';

const pt_pt = {
  translation,
  errors,
} satisfies LocalePhrase;

export default Object.freeze(pt_pt);
