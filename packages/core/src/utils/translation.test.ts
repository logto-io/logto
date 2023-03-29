import en from '@logto/phrases-ui/lib/locales/en/index.js';
import fr from '@logto/phrases-ui/lib/locales/fr/index.js';

import { isStrictlyPartial } from '#src/utils/translation.js';

describe('isStrictlyPartial', () => {
  it('should be true when its structure is valid', () => {
    expect(isStrictlyPartial(en.translation, fr.translation)).toBeTruthy();
  });

  it('should be true when the structure is partial and the existing key-value pairs are correct', () => {
    expect(
      isStrictlyPartial(en.translation, {
        secondary: {
          social_bind_with: 'Se connecter avec {{methods, list(type: disjunction;)}}',
          // Missing 'secondary.social_bind_with' key-value pair
        },
      })
    ).toBeTruthy();
  });

  it('should be false when there is an unexpected key-value pair', () => {
    expect(
      isStrictlyPartial(en.translation, {
        secondary: {
          foo: 'bar', // Unexpected key-value pair
        },
      })
    ).toBeFalsy();
  });
});
