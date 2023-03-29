import type { LocalePhrase } from '../../types.js';

import errors from './errors/index.js';
import translation from './translation/index.js';

const ko: LocalePhrase = Object.freeze({
  translation,
  errors,
});

export default ko;
