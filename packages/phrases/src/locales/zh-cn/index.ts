import type { LocalePhrase } from '../../types.js';

import errors from './errors.js';
import translation from './translation/index.js';

const zhCN: LocalePhrase = Object.freeze({
  translation,
  errors,
});

export default zhCN;
