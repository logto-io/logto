import type { LocalePhrase } from '../../types.js';

import errors from './errors/index.js';
import translation from './translation/index.js';

const es: LocalePhrase = Object.freeze({
  translation,
  errors,
});

export default es;
