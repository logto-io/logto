import type { LocalPhrase } from '../../types.js';

import errors from './errors/index.js';
import translation from './translation/index.js';

const en: LocalPhrase = Object.freeze({
  translation,
  errors,
});

export default en;
