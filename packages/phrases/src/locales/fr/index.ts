import en from '../en';
import errors from './errors';
import translation from './translation';

const fr: typeof en = Object.freeze({
  translation,
  errors,
});

export default fr;
