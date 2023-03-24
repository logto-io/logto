import type { LocalPhrase } from '../../types.js';

import errors from './errors.js';
import translation from './translation/index.js';

const trTR: LocalPhrase = Object.freeze({
  translation,
  errors,
});

export default trTR;
