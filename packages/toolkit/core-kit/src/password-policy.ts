import { type DeepPartial } from '@silverhand/essentials';
import { z } from 'zod';

/** Password policy configuration type. */
export type PasswordPolicy = {
  /** Policy about password length. */
  length: {
    /** Minimum password length. */
    min: number;
    /** Maximum password length. */
    max: number;
  };
  /**
   * Policy about password character types. Four types of characters are supported:
   *
   * - Lowercase letters (a-z).
   * - Uppercase letters (A-Z).
   * - Digits (0-9).
   * - Symbols ({@link PasswordPolicyChecker.symbols}).
   */
  characterTypes: {
    /** Minimum number of character types. Range: 1-4. */
    min: number;
  };
  /** Policy about what passwords to reject. */
  rejects: {
    /** Whether to reject passwords that are pwned. */
    pwned: boolean;
    /** Whether to reject passwords that like '123456' or 'aaaaaa'. */
    repetitionAndSequence: boolean;
    /** Whether to reject passwords that include personal information. */
    personalInfo: boolean;
    /** Whether to reject passwords that include specific words. */
    words: string[];
  };
};

/** Password policy configuration guard. */
export const passwordPolicyGuard = z.object({
  length: z
    .object({
      min: z.number().int().min(1).default(8),
      max: z.number().int().min(1).default(256),
    })
    .default({}),
  characterTypes: z
    .object({
      min: z.number().int().min(1).max(4).optional().default(2),
    })
    .default({}),
  rejects: z
    .object({
      pwned: z.boolean().default(true),
      repetitionAndSequence: z.boolean().default(true),
      personalInfo: z.boolean().default(true),
      words: z.string().array().default([]),
    })
    .default({}),
}) satisfies z.ZodType<PasswordPolicy, z.ZodTypeDef, DeepPartial<PasswordPolicy>>;

/** The code of why a password is rejected. */
export type PasswordRejectionCode =
  | 'too_short'
  | 'too_long'
  | 'character_types'
  | 'unsupported_characters'
  | 'pwned'
  | 'restricted.repetition'
  | 'restricted.sequence'
  | 'restricted.personal_info'
  | 'restricted.words';

/** A password issue that does not meet the policy. */
export type PasswordIssue<Code extends PasswordRejectionCode = PasswordRejectionCode> = {
  /** Issue code. */
  code: `password_rejected.${Code}`;
  /** Interpolation data for the issue message. */
  interpolation?: Record<string, unknown>;
};

/** Personal information to check. */
export type PersonalInfo = Partial<{
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
}>;

/**
 * The class for checking if a password meets the policy. The policy is defined as
 * {@link PasswordPolicy}.
 *
 * @example
 * ```ts
 * const checker = new PasswordPolicyChecker({
 *   length: { min: 8, max: 256 },
 *   characterTypes: { min: 2 },
 *   rejects: { pwned: true, repetitionAndSequence: true, words: [] },
 * });
 *
 * const issues = await checker.check('123456');
 * console.log(issues);
 * // [
 * //   { code: 'password_rejected.too_short' },
 * //   { code: 'password_rejected.character_types', interpolation: { min: 2 } },
 * //   { code: 'password_rejected.pwned' },
 * //   { code: 'password_rejected.restricted.sequence' },
 * // ]
 * ```
 */
export class PasswordPolicyChecker {
  static symbols = Object.freeze('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~' as const);

  public readonly policy: PasswordPolicy;

  constructor(
    policy: DeepPartial<PasswordPolicy>,
    /** The Web Crypto API to use. By default, the global `crypto.subtle` will be used. */
    protected readonly subtle: SubtleCrypto = crypto.subtle
  ) {
    this.policy = passwordPolicyGuard.parse(policy);
  }

  /**
   * Check if a password meets all the policy requirements.
   *
   * @param password - Password to check.
   * @param personalInfo - Personal information to check. Required if the policy
   * requires to reject passwords that include personal information.
   * @returns An array of issues. If the password meets the policy, an empty array will be returned.
   * @throws TypeError - If the policy requires to reject passwords that include personal information
   * but the personal information is not provided.
   */
  /* eslint-disable @silverhand/fp/no-mutating-methods */

  async check(password: string, personalInfo?: PersonalInfo): Promise<PasswordIssue[]> {
    const issues: PasswordIssue[] = this.fastCheck(password);

    if (this.policy.rejects.pwned && (await this.hasBeenPwned(password))) {
      issues.push({
        code: 'password_rejected.pwned',
      });
    }

    if (this.policy.rejects.repetitionAndSequence) {
      if (this.hasRepetition(password)) {
        issues.push({
          code: 'password_rejected.restricted.repetition',
        });
      }

      if (this.hasSequentialChars(password)) {
        issues.push({
          code: 'password_rejected.restricted.sequence',
        });
      }
    }

    const words = this.hasWords(password);

    if (words.length > 0) {
      issues.push({
        code: 'password_rejected.restricted.words',
        interpolation: { words: words.join('\n'), count: words.length },
      });
    }

    if (this.policy.rejects.personalInfo) {
      if (!personalInfo) {
        throw new TypeError('Personal information is required to check personal information.');
      }

      if (this.hasPersonalInfo(password, personalInfo)) {
        issues.push({
          code: 'password_rejected.restricted.personal_info',
        });
      }
    }

    return issues;
  }

  /**
   * Perform a fast check to see if the password passes the basic requirements.
   * Only the length and character types will be checked.
   *
   * This method is used for frontend validation.
   *
   * @param password - Password to check.
   * @returns Whether the password passes the basic requirements.
   */
  fastCheck(password: string) {
    const issues: PasswordIssue[] = [];

    if (password.length < this.policy.length.min) {
      issues.push({
        code: 'password_rejected.too_short',
        interpolation: { min: this.policy.length.min },
      });
    } else if (password.length > this.policy.length.max) {
      issues.push({
        code: 'password_rejected.too_long',
        interpolation: { max: this.policy.length.max },
      });
    }

    const characterTypes = this.checkCharTypes(password);
    if (characterTypes === 'unsupported') {
      issues.push({
        code: 'password_rejected.unsupported_characters',
      });
    } else if (!characterTypes) {
      issues.push({
        code: 'password_rejected.character_types',
        interpolation: { min: this.policy.characterTypes.min },
      });
    }

    return issues;
  }
  /* eslint-enable @silverhand/fp/no-mutating-methods */

  /**
   * Check if the given password contains enough character types.
   *
   * @param password - Password to check.
   * @returns Whether the password contains enough character types; or `'unsupported'`
   * if the password contains unsupported characters.
   */
  checkCharTypes(password: string): boolean | 'unsupported' {
    const characterTypes = new Set<string>();
    for (const char of password) {
      if (char >= 'a' && char <= 'z') {
        characterTypes.add('lowercase');
      } else if (char >= 'A' && char <= 'Z') {
        characterTypes.add('uppercase');
      } else if (char >= '0' && char <= '9') {
        characterTypes.add('digits');
      } else if (PasswordPolicyChecker.symbols.includes(char)) {
        characterTypes.add('symbols');
      } else {
        return 'unsupported';
      }
    }

    return characterTypes.size >= this.policy.characterTypes.min;
  }

  /**
   * Check if the given password has been pwned.
   *
   * @param password - Password to check.
   * @returns Whether the password has been pwned.
   */
  async hasBeenPwned(password: string): Promise<boolean> {
    const hash = await this.subtle.digest('SHA-1', new TextEncoder().encode(password));
    const hashHex = Array.from(new Uint8Array(hash))
      .map((binary) => binary.toString(16).padStart(2, '0'))
      .join('');
    const hashPrefix = hashHex.slice(0, 5);
    const hashSuffix = hashHex.slice(5);
    const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`);
    const text = await response.text();
    const hashes = text.split('\n');
    const found = hashes.some((hex) => hex.toLowerCase().startsWith(hashSuffix));

    return found;
  }

  /**
   * Check if the given password contains repetition characters that are more than
   * 4 characters or equal to the password length.
   *
   * @param password - Password to check.
   * @returns Whether the password contains repetition characters.
   */
  hasRepetition(password: string): boolean {
    const matchedRepetition = password.match(
      new RegExp(`(.)\\1{${Math.min(password.length - 1, 4)},}`, 'g')
    );

    return Boolean(matchedRepetition);
  }

  /**
   * Check if the given password contains personal information.
   *
   * @param password - Password to check.
   * @param personalInfo - Personal information to check.
   * @returns Whether the password contains personal information.
   */
  hasPersonalInfo(password: string, personalInfo: PersonalInfo): boolean {
    const lowercasedPassword = password.toLowerCase();
    const { name, username, email, phoneNumber } = personalInfo;

    if (
      name
        ?.toLowerCase()
        .split(' ')
        .some((word) => lowercasedPassword.includes(word))
    ) {
      return true;
    }

    if (username && lowercasedPassword.includes(username.toLowerCase())) {
      return true;
    }

    const emailPrefix = email?.split('@')[0];
    if (emailPrefix && lowercasedPassword.includes(emailPrefix.toLowerCase())) {
      return true;
    }

    if (phoneNumber && lowercasedPassword.includes(phoneNumber)) {
      return true;
    }

    return false;
  }

  /**
   * Check if the given password contains specific words.
   *
   * @param password - Password to check.
   * @returns An array of matched words.
   */
  hasWords(password: string): string[] {
    const words = this.policy.rejects.words.map((word) => word.toLowerCase());
    const lowercasedPassword = password.toLowerCase();

    return words.filter((word) => lowercasedPassword.includes(word));
  }

  /**
   * Check if the given password contains sequential characters, and the number of
   * sequential characters is over 4 or equal to the password length when (1 < length < 5).
   *
   * @param password - Password to check.
   * @returns Whether the password contains sequential characters.
   *
   * @example
   * ```ts
   * hasSequentialChars('1'); // false
   * hasSequentialChars('12345'); // true
   * hasSequentialChars('123456@Bc.dcE'); // true
   * hasSequentialChars('123@Bc.dcE'); // false
   * ```
   */
  // Disable the mutation rules because the algorithm is much easier to implement with
  /* eslint-disable @silverhand/fp/no-let, @silverhand/fp/no-mutation, @silverhand/fp/no-mutating-methods */
  hasSequentialChars(password: string): boolean {
    let sequence: number[] = [];

    for (const char of password) {
      // Always true
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const charCode = char.codePointAt(0)!;

      if (sequence.length === 0) {
        sequence.push(charCode);
        continue;
      }

      if (
        this.checkSequentialWithChar(sequence, charCode, 1) ||
        this.checkSequentialWithChar(sequence, charCode, -1)
      ) {
        sequence.push(charCode);
      } else {
        sequence = [charCode];
      }

      if (sequence.length >= 5 || sequence.length === password.length) {
        return true;
      }
    }

    return false;
  }
  /* eslint-enable @silverhand/fp/no-let, @silverhand/fp/no-mutation, @silverhand/fp/no-mutating-methods */

  /**
   * Check if the given char code will be sequential after appending to the given
   * char code array.
   */
  protected checkSequentialWithChar(
    current: Readonly<number[]>,
    newCharCode: number,
    direction: 1 | -1
  ): boolean {
    const lastCharCode = current.at(-1);

    if (newCharCode - direction === lastCharCode) {
      if (current.length === 1) {
        return true;
      }
      if (current.at(-2) === newCharCode - direction * 2) {
        return true;
      }
    }

    return false;
  }
}
