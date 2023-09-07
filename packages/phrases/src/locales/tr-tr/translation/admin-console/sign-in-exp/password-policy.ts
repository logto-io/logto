const password_policy = {
  /** UNTRANSLATED */
  password_requirements: 'Password requirements',
  /** UNTRANSLATED */
  minimum_length: 'Minimum length',
  /** UNTRANSLATED */
  minimum_length_description:
    'NIST suggests using <a>at least 8 characters</a> for web products. The maximum length is {{max}}.',
  /** UNTRANSLATED */
  minimum_length_error: 'Minimum length must be between {{min}} and {{max}} (inclusive).',
  /** UNTRANSLATED */
  minimum_required_char_types: 'Minimum required character types',
  /** UNTRANSLATED */
  minimum_required_char_types_description:
    'Lowercase letters (A-Z), uppercase letters (a-z), numbers (0-9), and special characters ({{symbols}}) are all.',
  /** UNTRANSLATED */
  password_rejection: 'Password rejection',
  /** UNTRANSLATED */
  compromised_passwords: 'Reject compromised password',
  /** UNTRANSLATED */
  breached_passwords: 'Breached passwords',
  /** UNTRANSLATED */
  breached_passwords_description: 'Reject passwords previously found in breach databases.',
  /** UNTRANSLATED */
  restricted_phrases: 'Restrict low-security phrases',
  /** UNTRANSLATED */
  restricted_phrases_tooltip:
    'Users cannot use passwords that are exactly the same as or made up of the listed phrases below. The addition of 3 or more non-consecutive characters is allowed to increase password complexity.',
  /** UNTRANSLATED */
  repetitive_or_sequential_characters: 'Repetitive or sequential characters',
  /** UNTRANSLATED */
  repetitive_or_sequential_characters_description: 'E.g., "AAAA", "1234", and "abcd".',
  /** UNTRANSLATED */
  user_information: 'User information',
  /** UNTRANSLATED */
  user_information_description: 'E.g., email address, phone number, username, etc.',
  /** UNTRANSLATED */
  custom_words: 'Custom words',
  /** UNTRANSLATED */
  custom_words_description:
    'Personalize context-specific words, case-insensitive, and one per line.',
  /** UNTRANSLATED */
  custom_words_placeholder: 'Your service name, company name, etc.',
};

export default Object.freeze(password_policy);
