import en from '@logto/phrases-ui/lib/locales/en';
import fr from '@logto/phrases-ui/lib/locales/fr';

import { isValidStructure } from '@/utils/translation';

const customizedFrTranslation = {
  secondary: {
    sign_in_with: 'Customized value A',
    social_bind_with: 'Customized value B',
  },
};

describe('isValidStructure', () => {
  it('should be true when its structure is valid', () => {
    expect(isValidStructure(en.translation, fr.translation)).toBeTruthy();
    expect(isValidStructure(en.translation, customizedFrTranslation)).toBeTruthy();
  });

  it('should be true when the structure is partial and the existing key-value pairs are correct', () => {
    expect(
      isValidStructure(en.translation, {
        secondary: {
          sign_in_with: 'Se connecter avec {{methods, list(type: disjunction;)}}',
          // Missing 'secondary.social_bind_with' key-value pair
        },
      })
    ).toBeTruthy();
  });

  it('should be false when there is an unexpected key-value pair', () => {
    expect(
      isValidStructure(en.translation, {
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
