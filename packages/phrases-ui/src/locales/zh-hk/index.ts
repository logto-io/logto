import type { LocalePhrase } from '../../types.js';

import action from './action.js';
import demo_app from './demo-app.js';
import description from './description.js';
import error from './error.js';
import input from './input.js';
import secondary from './secondary.js';

const zh_hk = {
  translation: {
    input,
    secondary,
    action,
    description,
    error,
    demo_app,
  },
} satisfies LocalePhrase;

export default Object.freeze(zh_hk);
