const connector_details = {
  page_title: 'Connector details',
  back_to_connectors: 'Back to connectors',
  check_readme: 'Check README',
  settings: 'General settings',
  settings_description:
    'Connectors play a critical role in Logto. With their help, Logto enables end-users to use passwordless registration or sign-in and the capabilities of signing in with social accounts.',
  parameter_configuration: 'Parameter configuration',
  test_connection: 'Test',
  save_error_empty_config: 'Please enter config',
  send: 'Send',
  send_error_invalid_format: 'Invalid input',
  edit_config_label: 'Enter your JSON here',
  test_email_sender: 'Test your email connector',
  test_sms_sender: 'Test your SMS connector',
  test_email_placeholder: 'john.doe@example.com',
  test_sms_placeholder: '+1 555-123-4567',
  test_message_sent: 'Test message sent',
  test_sender_description:
    'Logto uses the "Generic" template for testing. You will receive a message if your connector is rightly configured.',
  options_change_email: 'Change email connector',
  options_change_sms: 'Change SMS connector',
  connector_deleted: 'The connector has been successfully deleted',
  type_email: 'Email connector',
  type_sms: 'SMS connector',
  type_social: 'Social connector',
  in_used_social_deletion_description:
    'This connector is in-use in your sign in experience. By deleting, <name/> sign in experience will be deleted in sign in experience settings. You will need to reconfigure it if you decide to add it back.',
  in_used_passwordless_deletion_description:
    'This {{name}} is in-use in your sign-in experience. By deleting, your sign-in experience will not work properly until you resolve the conflict. You will need to reconfigure it if you decide to add it back.',
  deletion_description:
    'You are removing this connector. It cannot be undone, and you will need to reconfigure it if you decide to add it back.',
  logto_email: {
    total_email_sent: 'Total email sent: {{value, number}}',
    total_email_sent_tip:
      'Logto utilizes SendGrid for secure and stable built-in email. It’s completely free to use. <a>Learn more</a>',
    email_template_title: 'Email Template',
    template_description:
      'Built-in email uses default templates for seamless delivery of verification emails. No configuration is required, and you can customize basic brand information.',
    template_description_link_text: 'View templates',
    description_action_text: 'View templates',
    from_email_field: 'From email',
    sender_name_field: 'Sender name',
    sender_name_tip:
      'Customize the sender name for emails. If left empty, "Verification" will be used as the default name.',
    sender_name_placeholder: 'Your sender name',
    company_information_field: 'Company information',
    company_information_description:
      'Display your company name, address, or zip code in the bottom of emails to enhance authenticity.',
    company_information_placeholder: "Your company's basic information",
    email_logo_field: 'Email logo',
    email_logo_tip:
      'Display your brand logo in the top of emails. Use the same image for both light mode and dark mode.',
    urls_not_allowed: 'URLs are not allowed',
    test_notes: 'Logto uses the “Generic” template for testing.',
  },
  google_one_tap: {
    title: 'Google One Tap',
    description: 'Google One Tap is a secure and easy way for users to sign in to your website.',
    enable_google_one_tap: 'Enable Google One Tap',
    enable_google_one_tap_description:
      "Enable Google One Tap in your sign-in experience: Let users quickly sign up or sign in with their Google account if they're already signed in on their device.",
    configure_google_one_tap: 'Configure Google One Tap',
    auto_select: 'Auto-select credential if possible',
    close_on_tap_outside: 'Cancel the prompt if user click/tap outside',
    itp_support: 'Enable <a>Upgraded One Tap UX on ITP browsers</a>',
  },
};

export default Object.freeze(connector_details);
