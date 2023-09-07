const password_policy = {
  password_requirements: 'Password requirements',
  minimum_length: 'Minimum length',
  minimum_length_description:
    'NIST recommends a minimum of 8 characters for web products. The maximum length is fixed at {{max}} characters.',
  minimum_length_error: 'Minimum length must be between {{min}} and {{max}} (inclusive).',
  minimum_required_char_types: 'Minimum required character types',
  minimum_required_char_types_description:
    'The four character types are lowercase letters (a-z), uppercase letters (A-Z), numbers (0-9), and special characters ({{symbols}}).',
  password_rejection: 'Password rejection',
  forbidden_passwords: 'Forbidden passwords',
  breached_passwords: 'Breached passwords',
  breached_passwords_description:
    'Prevent users from using passwords that have been breached in other systems.',
  restricted_phrases_in_passwords: 'Restricted phrases in passwords',
  repetitive_or_sequential_characters: 'Repetitive or sequential characters',
  repetitive_or_sequential_characters_description: "For example, 'aaaaa' or '12345'",
  personal_information: 'Personal information',
  personal_information_description:
    'Email address, phone number, username, first name, last name, etc.',
  custom_words: 'Custom words',
  custom_words_description:
    'Customize the list of words to reject. Enter one word per line. Words are case-insensitive.',
  custom_words_placeholder: 'Your service name, company name, etc.',
};

export default Object.freeze(password_policy);
