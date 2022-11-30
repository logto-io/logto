import en from '@logto/phrases-ui/lib/locales/en.js';
import fr from '@logto/phrases-ui/lib/locales/fr.js';

import { isStrictlyPartial } from '#src/utils/translation.js';

const customizedFrTranslation = {
  secondary: {
    sign_in_with: 'Customized value A',
    social_bind_with: 'Customized value B',
  },
};

describe('isStrictlyPartial', () => {
  it('should be true when its structure is valid', () => {
    expect(isStrictlyPartial(en.translation, fr.translation)).toBeTruthy();
    expect(isStrictlyPartial(en.translation, customizedFrTranslation)).toBeTruthy();
  });

  it('should be true when the structure is partial and the existing key-value pairs are correct', () => {
    expect(
      isStrictlyPartial(en.translation, {
        secondary: {
          sign_in_with: 'Se connecter avec {{methods, list(type: disjunction;)}}',
          // Missing 'secondary.social_bind_with' key-value pair
        },
      })
    ).toBeTruthy();
  });

  it('should be false when there is an unexpected key-value pair', () => {
    expect(
      isStrictlyPartial(en.translation, {
        secondary: {
          sign_in_with: 'Se connecter avec {{methods, list(type: disjunction;)}}',
          social_bind_with:
            'Vous avez déjà un compte ? Connectez-vous pour lier {{methods, list(type: disjunction;)}} avec votre identité sociale.',
          foo: 'bar', // Unexpected key-value pair
        },
      })
    ).toBeFalsy();
  });
});
