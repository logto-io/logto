import type { LocalePhrase } from '../../types.js';

import errors from './errors/index.js';
import translation from './translation/index.js';

const zh_hk = {
  translation,
  errors,
} satisfies LocalePhrase;

export default Object.freeze(zh_hk);
