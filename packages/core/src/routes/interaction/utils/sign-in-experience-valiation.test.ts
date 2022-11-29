import type { SignInExperience } from '@logto/schemas';
import { SignInExperienceIdentifier, SignInMode } from '@logto/schemas';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';

import { signInModeValidation, identifierValidation } from './sign-in-experience-validation.js';

describe('signInModeValidation', () => {
  it('register', () => {
    expect(() => {
      signInModeValidation('register', { signInMode: SignInMode.SignIn } as SignInExperience);
    }).toThrow();
    expect(() => {
      signInModeValidation('register', { signInMode: SignInMode.Register } as SignInExperience);
    }).not.toThrow();
    expect(() => {
      signInModeValidation('register', {
        signInMode: SignInMode.SignInAndRegister,
      } as SignInExperience);
    }).not.toThrow();
  });

  it('SignIn', () => {
    expect(() => {
      signInModeValidation('sign-in', { signInMode: SignInMode.SignIn } as SignInExperience);
    }).not.toThrow();
    expect(() => {
      signInModeValidation('sign-in', { signInMode: SignInMode.Register } as SignInExperience);
    }).toThrow();
    expect(() => {
      signInModeValidation('sign-in', {
        signInMode: SignInMode.SignInAndRegister,
      } as SignInExperience);
    }).not.toThrow();
  });

  it('forgot-password', () => {
    expect(() => {
      signInModeValidation('forgot-password', {
        signInMode: SignInMode.SignIn,
      } as SignInExperience);
    }).not.toThrow();
    expect(() => {
      signInModeValidation('forgot-password', {
        signInMode: SignInMode.Register,
      } as SignInExperience);
    }).not.toThrow();
    expect(() => {
      signInModeValidation('forgot-password', {
        signInMode: SignInMode.SignInAndRegister,
      } as SignInExperience);
    }).not.toThrow();
  });
});

describe('identifier validation', () => {
  it('username-password', () => {
    const identifier = { username: 'username', password: 'password' };

    expect(() => {
      identifierValidation(identifier, mockSignInExperience);
    }).not.toThrow();

    expect(() => {
      identifierValidation(identifier, {
        ...mockSignInExperience,
        signIn: {
          methods: mockSignInExperience.signIn.methods.filter(
            ({ identifier }) => identifier !== SignInExperienceIdentifier.Username
          ),
        },
      });
    }).toThrow();
  });

  it('email password', () => {
    const identifier = { email: 'email', password: 'password' };

    expect(() => {
      identifierValidation(identifier, mockSignInExperience);
    }).not.toThrow();

    expect(() => {
      identifierValidation(identifier, {
        ...mockSignInExperience,
        signIn: {
          methods: mockSignInExperience.signIn.methods.filter(
            ({ identifier }) => identifier !== SignInExperienceIdentifier.Email
          ),
        },
      });
    }).toThrow();

    expect(() => {
      identifierValidation(identifier, {
        ...mockSignInExperience,
        signIn: {
          methods: [
            {
              identifier: SignInExperienceIdentifier.Email,
              password: false,
              verificationCode: true,
              isPasswordPrimary: true,
            },
          ],
        },
      });
    }).toThrow();
  });

  it('email passcode', () => {
    const identifier = { email: 'email', passcode: 'passcode' };

    expect(() => {
      identifierValidation(identifier, mockSignInExperience);
    }).not.toThrow();

    expect(() => {
      identifierValidation(identifier, {
        ...mockSignInExperience,
        signIn: {
          methods: mockSignInExperience.signIn.methods.filter(
            ({ identifier }) => identifier !== SignInExperienceIdentifier.Email
          ),
        },
      });
    }).toThrow();

    expect(() => {
      identifierValidation(identifier, {
        ...mockSignInExperience,
        signIn: {
          methods: [
            {
              identifier: SignInExperienceIdentifier.Email,
              password: true,
              verificationCode: false,
              isPasswordPrimary: true,
            },
          ],
        },
      });
    }).toThrow();

    expect(() => {
      identifierValidation(identifier, {
        ...mockSignInExperience,
        signUp: {
          identifiers: [SignInExperienceIdentifier.Email],
          password: false,
          verify: true,
        },
        signIn: {
          methods: [
            {
              identifier: SignInExperienceIdentifier.Email,
              password: true,
              verificationCode: false,
              isPasswordPrimary: true,
            },
          ],
        },
      });
    }).not.toThrow();
  });

  it('phone password', () => {
    const identifier = { phone: '123', password: 'password' };

    expect(() => {
      identifierValidation(identifier, mockSignInExperience);
    }).not.toThrow();

    expect(() => {
      identifierValidation(identifier, {
        ...mockSignInExperience,
        signIn: {
          methods: mockSignInExperience.signIn.methods.filter(
            ({ identifier }) => identifier !== SignInExperienceIdentifier.Sms
          ),
        },
      });
    }).toThrow();

    expect(() => {
      identifierValidation(identifier, {
        ...mockSignInExperience,
        signIn: {
          methods: [
            {
              identifier: SignInExperienceIdentifier.Sms,
              password: false,
              verificationCode: true,
              isPasswordPrimary: true,
            },
          ],
        },
      });
    }).toThrow();
  });

  it('phone passcode', () => {
    const identifier = { phone: '123456', passcode: 'passcode' };

    expect(() => {
      identifierValidation(identifier, mockSignInExperience);
    }).not.toThrow();

    expect(() => {
      identifierValidation(identifier, {
        ...mockSignInExperience,
        signIn: {
          methods: mockSignInExperience.signIn.methods.filter(
            ({ identifier }) => identifier !== SignInExperienceIdentifier.Sms
          ),
        },
      });
    }).toThrow();

    expect(() => {
      identifierValidation(identifier, {
        ...mockSignInExperience,
        signIn: {
          methods: [
            {
              identifier: SignInExperienceIdentifier.Sms,
              password: true,
              verificationCode: false,
              isPasswordPrimary: true,
            },
          ],
        },
      });
    }).toThrow();

    expect(() => {
      identifierValidation(identifier, {
        ...mockSignInExperience,
        signUp: {
          identifiers: [SignInExperienceIdentifier.Sms],
          password: false,
          verify: true,
        },
        signIn: {
          methods: [
            {
              identifier: SignInExperienceIdentifier.Sms,
              password: true,
              verificationCode: false,
              isPasswordPrimary: true,
            },
          ],
        },
      });
    }).not.toThrow();
  });
});
