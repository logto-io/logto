import type { SignInExperience } from '@logto/schemas';
import { SignInIdentifier, SignInMode, Event } from '@logto/schemas';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';

import {
  verifySignInModeSettings,
  verifyIdentifierSettings,
  verifyProfileSettings,
} from './sign-in-experience-validation.js';

describe('verifySignInModeSettings', () => {
  it(Event.Register, () => {
    expect(() => {
      verifySignInModeSettings(Event.Register, {
        signInMode: SignInMode.SignIn,
      } as SignInExperience);
    }).toThrow();
    expect(() => {
      verifySignInModeSettings(Event.Register, {
        signInMode: SignInMode.Register,
      } as SignInExperience);
    }).not.toThrow();
    expect(() => {
      verifySignInModeSettings(Event.Register, {
        signInMode: SignInMode.SignInAndRegister,
      } as SignInExperience);
    }).not.toThrow();
  });

  it('SignIn', () => {
    expect(() => {
      verifySignInModeSettings(Event.SignIn, { signInMode: SignInMode.SignIn } as SignInExperience);
    }).not.toThrow();
    expect(() => {
      verifySignInModeSettings(Event.SignIn, {
        signInMode: SignInMode.Register,
      } as SignInExperience);
    }).toThrow();
    expect(() => {
      verifySignInModeSettings(Event.SignIn, {
        signInMode: SignInMode.SignInAndRegister,
      } as SignInExperience);
    }).not.toThrow();
  });

  it(Event.ForgotPassword, () => {
    expect(() => {
      verifySignInModeSettings(Event.ForgotPassword, {
        signInMode: SignInMode.SignIn,
      } as SignInExperience);
    }).not.toThrow();
    expect(() => {
      verifySignInModeSettings(Event.ForgotPassword, {
        signInMode: SignInMode.Register,
      } as SignInExperience);
    }).not.toThrow();
    expect(() => {
      verifySignInModeSettings(Event.ForgotPassword, {
        signInMode: SignInMode.SignInAndRegister,
      } as SignInExperience);
    }).not.toThrow();
  });
});

describe('identifier validation', () => {
  it('username-password', () => {
    const identifier = { username: 'username', password: 'password' };

    expect(() => {
      verifyIdentifierSettings(identifier, mockSignInExperience);
    }).not.toThrow();

    expect(() => {
      verifyIdentifierSettings(identifier, {
        ...mockSignInExperience,
        signIn: {
          methods: mockSignInExperience.signIn.methods.filter(
            ({ identifier }) => identifier !== SignInIdentifier.Username
          ),
        },
      });
    }).toThrow();
  });

  it('email password', () => {
    const identifier = { email: 'email', password: 'password' };

    expect(() => {
      verifyIdentifierSettings(identifier, mockSignInExperience);
    }).not.toThrow();

    expect(() => {
      verifyIdentifierSettings(identifier, {
        ...mockSignInExperience,
        signIn: {
          methods: mockSignInExperience.signIn.methods.filter(
            ({ identifier }) => identifier !== SignInIdentifier.Email
          ),
        },
      });
    }).toThrow();

    expect(() => {
      verifyIdentifierSettings(identifier, {
        ...mockSignInExperience,
        signIn: {
          methods: [
            {
              identifier: SignInIdentifier.Email,
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
      verifyIdentifierSettings(identifier, mockSignInExperience);
    }).not.toThrow();

    expect(() => {
      verifyIdentifierSettings(identifier, {
        ...mockSignInExperience,
        signIn: {
          methods: mockSignInExperience.signIn.methods.filter(
            ({ identifier }) => identifier !== SignInIdentifier.Email
          ),
        },
      });
    }).toThrow();

    expect(() => {
      verifyIdentifierSettings(identifier, {
        ...mockSignInExperience,
        signIn: {
          methods: [
            {
              identifier: SignInIdentifier.Email,
              password: true,
              verificationCode: false,
              isPasswordPrimary: true,
            },
          ],
        },
      });
    }).toThrow();

    expect(() => {
      verifyIdentifierSettings(identifier, {
        ...mockSignInExperience,
        signUp: {
          identifiers: [SignInIdentifier.Email],
          password: false,
          verify: true,
        },
        signIn: {
          methods: [
            {
              identifier: SignInIdentifier.Email,
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
      verifyIdentifierSettings(identifier, mockSignInExperience);
    }).not.toThrow();

    expect(() => {
      verifyIdentifierSettings(identifier, {
        ...mockSignInExperience,
        signIn: {
          methods: mockSignInExperience.signIn.methods.filter(
            ({ identifier }) => identifier !== SignInIdentifier.Sms
          ),
        },
      });
    }).toThrow();

    expect(() => {
      verifyIdentifierSettings(identifier, {
        ...mockSignInExperience,
        signIn: {
          methods: [
            {
              identifier: SignInIdentifier.Sms,
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
      verifyIdentifierSettings(identifier, mockSignInExperience);
    }).not.toThrow();

    expect(() => {
      verifyIdentifierSettings(identifier, {
        ...mockSignInExperience,
        signIn: {
          methods: mockSignInExperience.signIn.methods.filter(
            ({ identifier }) => identifier !== SignInIdentifier.Sms
          ),
        },
      });
    }).toThrow();

    expect(() => {
      verifyIdentifierSettings(identifier, {
        ...mockSignInExperience,
        signIn: {
          methods: [
            {
              identifier: SignInIdentifier.Sms,
              password: true,
              verificationCode: false,
              isPasswordPrimary: true,
            },
          ],
        },
      });
    }).toThrow();

    expect(() => {
      verifyIdentifierSettings(identifier, {
        ...mockSignInExperience,
        signUp: {
          identifiers: [SignInIdentifier.Sms],
          password: false,
          verify: true,
        },
        signIn: {
          methods: [
            {
              identifier: SignInIdentifier.Sms,
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

describe('profile validation', () => {
  it('profile sign-in-experience settings verification', () => {
    expect(() => {
      verifyProfileSettings({ username: 'foo', password: 'password' }, mockSignInExperience);
    }).not.toThrow();

    expect(() => {
      verifyProfileSettings({ email: 'email@logto.io' }, mockSignInExperience);
    }).toThrow();

    expect(() => {
      verifyProfileSettings(
        { email: 'email@logto.io' },
        {
          ...mockSignInExperience,
          signUp: { identifiers: [SignInIdentifier.Email], password: false, verify: true },
        }
      );
    }).not.toThrow();

    expect(() => {
      verifyProfileSettings({ phone: '123456' }, mockSignInExperience);
    }).toThrow();

    expect(() => {
      verifyProfileSettings(
        { phone: '123456' },
        {
          ...mockSignInExperience,
          signUp: { identifiers: [SignInIdentifier.Sms], password: false, verify: true },
        }
      );
    });
  });
});
