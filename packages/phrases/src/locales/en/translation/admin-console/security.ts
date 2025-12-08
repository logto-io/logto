const security = {
  page_title: 'Security',
  title: 'Security',
  subtitle: 'Configure advanced protection against sophisticated attacks.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'Password policy',
    blocklist: 'Blocklist',
    general: 'General',
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
    domain: 'Domain (optional)',
    domain_placeholder: 'www.google.com (default) or recaptcha.net',
    recaptcha_key_id: 'reCAPTCHA key ID',
    recaptcha_api_key: 'API key of the project',
    deletion_description: 'Are you sure you want to delete this CAPTCHA provider?',
    captcha_deleted: 'CAPTCHA provider deleted successfully',
    setup_captcha: 'Setup CAPTCHA',
    mode: 'Verification mode',
    mode_invisible: 'Invisible',
    mode_checkbox: 'Checkbox',
    mode_notice:
      'The verification mode is defined in your reCAPTCHA key settings in Google Cloud Console. Changing the mode here requires a matching key type.',
  },
  password_policy: {
    password_requirements: 'Password requirements',
    password_requirements_description:
      'Enhance password requirements to defend against credential stuffing and weak password attacks. ',
    minimum_length: 'Minimum length',
    minimum_length_description:
      'NIST suggests using <a>at least 8 characters</a> for web products.',
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
  },
  sentinel_policy: {
    card_title: 'Identifier lockout',
    card_description:
      'Lockout is available to all users with default settings, but you can customize it for more control.\n\nTemporarily lock an identifier after multiple failed authentication attempts (e.g., consecutive incorrect password or verification code) to prevent brute force access.',
    enable_sentinel_policy: {
      title: 'Customize lockout experience',
      description:
        'Allow customization of the maximum failed login attempts before lockout, lockout duration, and immediate manual unlock.',
    },
    max_attempts: {
      title: 'Maximum failed attempts',
      description:
        'Temporarily lock an identifier after reaching the maximum number of failed login attempts in an hour.',
      error_message: 'Maximum failed attempts must be greater than 0.',
    },
    lockout_duration: {
      title: 'Lockout duration (minutes)',
      description: 'Block sign-ins for a period after exceeding the maximum failed attempts limit.',
      error_message: 'Lockout duration must be at least 1 minute.',
    },
    manual_unlock: {
      title: 'Manual unlock',
      description:
        'Unlock users immediately by confirming their identity and entering their identifier.',
      unblock_by_identifiers: 'Unblock by identifier',
      modal_description_1:
        'An identifier was temporarily locked due to multiple failed sign-in/sign-up attempts. To protect security, access will automatically restore after the lockout duration.',
      modal_description_2:
        ' Only unlock manually if you’ve confirmed the user’s identity and ensured no unauthorized access attempts.',
      placeholder: 'Enter identifiers (email address / phone number / username)',
      confirm_button_text: 'Unlock now',
      success_toast: 'Unlocked successfully',
      duplicate_identifier_error: 'Identifier already added',
      empty_identifier_error: 'Please enter at least one identifier',
    },
  },
  blocklist: {
    card_title: 'Email blocklist',
    card_description:
      'Take control of your user base by blocking high-risk or unwanted email addresses.',
    disposable_email: {
      title: 'Block disposable email addresses',
      description:
        'Enable to reject any sign-up attempts using a disposable or throwaway email address, which can prevent spam and improve user quality.',
    },
    email_subaddressing: {
      title: 'Block email subaddressing',
      description:
        'Enable to reject any sign-up attempts from using email subaddresses with a plus sign (+) and additional characters (e.g., user+alias@foo.com).',
    },
    custom_email_address: {
      title: 'Block custom email addresses',
      description:
        'Add specific email domains or email address which cannot register or link via the UI.',
      placeholder:
        'Enter the blocked email address or domain (e.g., bar@example.com, @example.com)',
      duplicate_error: 'Email address or domain already added',
      invalid_format_error:
        'Must be a valid email address(bar@example.com) or domain(@example.com)',
    },
  },
};

export default Object.freeze(security);
