import type { LocalePhrase } from '../../types.js';

import action from './action.js';
import demo_app from './demo-app.js';
import description from './description.js';
import error from './error/index.js';
import input from './input.js';
import list from './list.js';
import mfa from './mfa.js';
import secondary from './secondary.js';

const it = {
  translation: {
    input,
    secondary,
    action,
    description,
    error,
    demo_app,
    list,
    mfa,
  },
} satisfies LocalePhrase;

export default Object.freeze(it);
