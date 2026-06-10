import { defaultUsernamePolicy } from '@logto/core-kit';
import resource from '@logto/phrases-experience';
import { type UsernamePolicy } from '@logto/schemas';
import i18next, { type TFunction } from 'i18next';

import { buildUsernamePolicyDescription } from './username-policy-description';

/**
 * A fake `t` that echoes keys and interpolation so the composition (which fragments and characters
 * are included, in what order) is observable without a real i18next instance.
 */
const translate = ((key: string, options?: Record<string, unknown>) => {
  switch (key) {
    case 'description.username_requirement.length': {
      return `len:${String(options?.min)}-${String(options?.max)}`;
    }
    case 'description.username_requirement.characters': {
      return `chars:${(options?.characters as string[]).join(',')}`;
    }
    case 'description.username_requirements': {
      return `req:${(options?.items as string[]).join('|')}`;
    }
    default: {
      return key.replace('description.username_character.', '');
    }
  }
}) as unknown as TFunction;

const build = (policy?: UsernamePolicy) => buildUsernamePolicyDescription(policy, translate);

describe('buildUsernamePolicyDescription', () => {
  it('returns undefined when no policy is provided', () => {
    expect(build()).toBeUndefined();
  });

  it('returns undefined for the permissive default policy', () => {
    expect(build(defaultUsernamePolicy)).toBeUndefined();
  });

  it('describes only the length when only the length is restrictive', () => {
    expect(build({ ...defaultUsernamePolicy, minLength: 4, maxLength: 8 })).toBe('req:len:4-8');
  });

  it('describes only the allowed characters when only the character set is restrictive', () => {
    expect(
      build({
        ...defaultUsernamePolicy,
        allowedChars: { lowercase: true, uppercase: false, numbers: false, underscore: false },
      })
    ).toBe('req:chars:lowercase');
  });

  it('describes both length and characters, listing only the allowed types in order', () => {
    expect(
      build({
        ...defaultUsernamePolicy,
        minLength: 4,
        maxLength: 8,
        allowedChars: { lowercase: true, uppercase: false, numbers: true, underscore: false },
      })
    ).toBe('req:len:4-8|chars:lowercase,number');
  });

  it('treats a tightened maximum length alone as restrictive', () => {
    expect(build({ ...defaultUsernamePolicy, maxLength: 20 })).toBe('req:len:1-20');
  });
});

describe('buildUsernamePolicyDescription with real phrases', () => {
  beforeAll(async () => {
    await i18next.init({
      lng: 'en',
      resources: { en: resource.en },
      interpolation: { escapeValue: false },
    });
  });

  it('composes a readable English sentence via the i18next list formatter', () => {
    const description = buildUsernamePolicyDescription(
      {
        ...defaultUsernamePolicy,
        minLength: 4,
        maxLength: 8,
        allowedChars: { lowercase: true, uppercase: false, numbers: true, underscore: false },
      },
      i18next.t.bind(i18next) as TFunction
    );

    expect(description).toBe(
      'Username must be 4 to 8 characters and can only contain lowercase letters and numbers.'
    );
  });
});
