import type { LocalPhrase } from '../../types';
import errors from './errors';
import translation from './translation';

const ko: LocalPhrase = Object.freeze({
  translation,
  errors,
});

export default ko;
