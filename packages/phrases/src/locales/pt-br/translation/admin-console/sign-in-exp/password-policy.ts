const password_policy = {
  /** UNTRANSLATED */
  password_requirements: 'Password requirements',
  /** UNTRANSLATED */
  minimum_length: 'Minimum length',
  /** UNTRANSLATED */
  minimum_length_description:
    'NIST recommends a minimum of 8 characters for web products. The maximum length is fixed at {{max}} characters.',
  /** UNTRANSLATED */
  minimum_length_error: 'Minimum length must be between {{min}} and {{max}} (inclusive).',
  /** UNTRANSLATED */
  minimum_required_char_types: 'Minimum required character types',
  /** UNTRANSLATED */
  minimum_required_char_types_description:
    'The four character types are lowercase letters (a-z), uppercase letters (A-Z), numbers (0-9), and special characters ({{symbols}}).',
  /** UNTRANSLATED */
  password_rejection: 'Password rejection',
  /** UNTRANSLATED */
  forbidden_passwords: 'Forbidden passwords',
  /** UNTRANSLATED */
  breached_passwords: 'Breached passwords',
  /** UNTRANSLATED */
  breached_passwords_description:
    'Prevent users from using passwords that have been breached in other systems.',
  /** UNTRANSLATED */
  restricted_phrases_in_passwords: 'Restricted phrases in passwords',
  /** UNTRANSLATED */
  repetitive_or_sequential_characters: 'Repetitive or sequential characters',
  /** UNTRANSLATED */
  repetitive_or_sequential_characters_description: "For example, 'aaaaa' or '12345'",
  /** UNTRANSLATED */
  personal_information: 'Personal information',
  /** UNTRANSLATED */
  personal_information_description:
    'Email address, phone number, username, first name, last name, etc.',
  /** UNTRANSLATED */
  custom_words: 'Custom words',
  /** UNTRANSLATED */
  custom_words_description:
    'Customize the list of words to reject. Enter one word per line. Words are case-insensitive.',
  /** UNTRANSLATED */
  custom_words_placeholder: 'Your service name, company name, etc.',
};

export default Object.freeze(password_policy);
