import type { LocalePhrase } from '../../types.js';

import errors from './errors.js';
import translation from './translation/index.js';

const ptBR: LocalePhrase = Object.freeze({
  translation,
  errors,
});

export default ptBR;
