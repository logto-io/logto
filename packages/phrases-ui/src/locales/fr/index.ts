import { type LocalePhrase } from '../../types.js';

import action from './action.js';
import demo_app from './demo-app.js';
import description from './description.js';
import error from './error.js';
import input from './input.js';
import secondary from './secondary.js';

const fr: LocalePhrase = Object.freeze({
  translation: {
    input,
    secondary,
    action,
    description,
    error,
    demo_app,
  },
});

export default fr;
