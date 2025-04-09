const password_policy = {
  password_requirements: 'Password requirements',
  minimum_length: 'Minimum length',
  minimum_length_description: 'NIST suggests using <a>at least 8 characters</a> for web products.',
  minimum_length_error: 'Minimum length must be between {{min}} and {{max}} (inclusive).',
  minimum_required_char_types: 'Minimum required character types',
  minimum_required_char_types_description:
    'Character types: uppercase (A-Z), lowercase (a-z), numbers (0-9), and special symbols ({{symbols}}).',
  password_rejection: 'Password rejection',
  compromised_passwords: 'Reject compromised password',
  breached_passwords: 'Breached passwords',
  breached_passwords_description: 'Reject passwords previously found in breach databases.',
  restricted_phrases: 'Restrict low-security phrases',
  restricted_phrases_tooltip:
    'Your password should avoid these phrases unless you combine with 3 or more extra characters.',
  repetitive_or_sequential_characters: 'Repetitive or sequential characters',
  repetitive_or_sequential_characters_description: 'E.g., "AAAA", "1234", and "abcd".',
  user_information: 'User information',
  user_information_description: 'E.g., email address, phone number, username, etc.',
  custom_words: 'Custom words',
  custom_words_description:
    'Personalize context-specific words, case-insensitive, and one per line.',
  custom_words_placeholder: 'Your service name, company name, etc.',
};

const security = {
  page_title: 'Security',
  title: 'Security',
  subtitle: 'Configure advanced protection against sophisticated attacks.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'Password policy',
  },
  bot_protection: {
    title: 'Bot protection',
    description:
      'Enable CAPTCHA for sign-up, sign-in, and password recovery to block automated threats.',
    captcha: {
      title: 'CAPTCHA',
      placeholder: 'Select a CAPTCHA provider and set up integration.',
      add: 'Add CAPTCHA',
    },
    settings: 'Settings',
    enable_captcha: 'Enable CAPTCHA',
    enable_captcha_description:
      'Enable CAPTCHA verification for sign-up, sign-in, and password recovery flows.',
  },
  create_captcha: {
    setup_captcha: 'Setup CAPTCHA',
  },
  captcha_providers: {
    recaptcha_enterprise: {
      name: 'reCAPTCHA Enterprise',
      description:
        "Google's enterprise-grade CAPTCHA solution that provides advanced threat detection and detailed security analytics to protect your website from fraudulent activities.",
    },
    turnstile: {
      name: 'Cloudflare Turnstile',
      description:
        "Cloudflare's smart CAPTCHA alternative that provides non-intrusive bot protection while ensuring a seamless user experience without visual puzzles.",
    },
  },
  captcha_details: {
    back_to_security: 'Back to security',
    page_title: 'CAPTCHA details',
    check_readme: 'Check README',
    options_change_captcha: 'Change CAPTCHA provider',
    connection: 'Connection',
    description: 'Configure your captcha connections.',
    site_key: 'Site key',
    secret_key: 'Secret key',
    project_id: 'Project ID',
    recaptcha_key_id: 'reCAPTCHA key ID',
    recaptcha_api_key: 'API key of the project',
    deletion_description: 'Are you sure you want to delete this CAPTCHA provider?',
    captcha_deleted: 'CAPTCHA provider deleted successfully',
    setup_captcha: 'Setup CAPTCHA',
  },
  password_policy,
};

export default Object.freeze(security);
