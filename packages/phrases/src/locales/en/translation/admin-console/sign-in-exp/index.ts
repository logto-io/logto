import content from './content.js';
import custom_profile_fields from './custom-profile-fields.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Sign-in experience',
  page_title_with_account: 'Sign-in & account',
  title: 'Sign-in & account',
  description:
    'Customize the authentication flows and UI, and preview the out-of-the-box experience in real time.',
  tabs: {
    branding: 'Branding',
    sign_up_and_sign_in: 'Sign-up and sign-in',
    collect_user_profile: 'Collect user profile',
    account_center: 'Account center',
    content: 'Content',
    password_policy: 'Password policy',
  },
  welcome: {
    title: 'Customize sign-in experience',
    description:
      'Get started fast with your first sign-in setup. This guide walks you through all the necessary settings.',
    get_started: 'Get started',
    apply_remind:
      'Please note that sign-in experience will apply to all applications under this account.',
  },
  color: {
    title: 'COLOR',
    primary_color: 'Brand color',
    dark_primary_color: 'Brand color (dark)',
    dark_mode: 'Enable dark mode',
    dark_mode_description:
      'Your app will have an auto-generated dark mode theme based on your brand color and Logto algorithm. You are free to customize.',
    dark_mode_reset_tip: 'Recalculate dark mode color based on brand color.',
    reset: 'Recalculate',
  },
  branding: {
    title: 'BRANDING AREA',
    ui_style: 'Style',
    with_light: '{{value}}',
    with_dark: '{{value}} (dark)',
    app_logo_and_favicon: 'App logo and favicon',
    company_logo_and_favicon: 'Company logo and favicon',
    organization_logo_and_favicon: 'Organization logo and favicon',
    hide_logto_branding: 'Hide Logto branding',
    hide_logto_branding_description:
      'Remove "Powered by Logto". Spotlight your brand exclusively with a clean, professional sign-in experience.',
  },
  branding_uploads: {
    app_logo: {
      title: 'App logo',
      url: 'App logo URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'App logo: {{error}}',
    },
    company_logo: {
      title: 'Company logo',
      url: 'Company logo URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Company logo: {{error}}',
    },
    organization_logo: {
      title: 'Upload image',
      url: 'Organization logo URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Organization logo: {{error}}',
    },
    connector_logo: {
      title: 'Upload image',
      url: 'Connector logo URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Connector logo: {{error}}',
    },
    favicon: {
      title: 'Favicon',
      url: 'Favicon URL',
      url_placeholder: 'https://your.cdn.domain/favicon.ico',
      error: 'Favicon: {{error}}',
    },
  },
  custom_ui: {
    title: 'Custom UI',
    css_code_editor_title: 'Custom CSS',
    css_code_editor_description1: 'See the example of custom CSS.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'Learn more',
    css_code_editor_content_placeholder:
      'Enter your custom CSS to tailor the styles of anything to your exact specifications. Express your creativity and make your UI stand out.',
    bring_your_ui_title: 'Bring your UI',
    bring_your_ui_description:
      'Upload a compressed package (.zip) to replace the Logto prebuilt UI with your own code. <a>Learn more</a>',
    preview_with_bring_your_ui_description:
      'Your custom UI assets have been successfully uploaded and are now being served. Consequently, the built-in preview window has been disabled.\nTo test your personalized sign-in UI, click the "Live Preview" button to open it in a new browser tab.',
  },
  account_center: {
    title: 'ACCOUNT CENTER',
    description:
      'Implement your account center for end users to manage account security and profile information.',
    enable_account_api: 'Enable account center',
    enable_account_api_description:
      "Enable the user-facing Account API with configurable permissions, giving you the choice between Logto's out-of-the-box account center or a fully custom solution.",
    field_options: {
      off: 'Off',
      edit: 'Edit',
      read_only: 'Read only',
      enabled: 'Enabled',
      disabled: 'Disabled',
    },
    sections: {
      account_security: {
        title: 'ACCOUNT SECURITY',
        description:
          'Manage access to the Account API, enabling users to view or edit their identity information and authentication factors after signing into the application. Users must verify their identity to get a valid 10-minute verification record ID before making these security-related changes.',
        groups: {
          identifiers: {
            title: 'Identifiers',
          },
          authentication_factors: {
            title: 'Authentication factors',
          },
        },
      },
      user_profile: {
        title: 'USER PROFILE',
        description:
          'Manage access to the Account API, enabling users to view or edit basic or custom profile data after signing into the application.',
        groups: {
          profile_data: {
            title: 'Profile data',
          },
        },
      },
      secret_vault: {
        title: 'SECRET VAULT',
        description:
          'For social and enterprise connectors, secure store third-party access tokens to call their APIs (e.g., add events to Google Calendar).',
        third_party_token_storage: {
          title: 'Third-party token',
          third_party_access_token_retrieval: 'Third-party access token retrieval',
          third_party_token_tooltip:
            "To store tokens, you can enable this in the corresponding social or enterprise connector's settings.",
          third_party_token_description:
            'Once the Account API is enabled, third-party token retrieval is automatically activated.',
        },
      },
    },
    fields: {
      email: 'Email address',
      phone: 'Phone number',
      social: 'Social identities',
      password: 'Password',
      mfa: 'Multi-factor authentication',
      mfa_description: 'Let users manage their MFA methods from the account center.',
      username: 'Username',
      name: 'Name',
      avatar: 'Avatar',
      profile: 'Profile',
      profile_description: 'Control access to structured profile attributes.',
      custom_data: 'Custom data',
      custom_data_description: 'Control access to custom JSON data stored on the user.',
    },
    webauthn_related_origins: 'WebAuthn Related Origins',
    webauthn_related_origins_description:
      'Add the domains of your front-end applications that are allowed to register passkeys via the Account API.',
    webauthn_related_origins_error: 'Origin must start with https:// or http://',
    prebuilt_ui: {
      title: 'INTEGRATE PREBUILT UI',
      description:
        'Quickly integrate out-of-the-box verification and security setting flows with prebuilt UI.',
      flows_title: 'Integrate out-of-the-box security setting flows',
      flows_description:
        'Combine your domain with the route to form your account setting URL (e.g., https://auth.foo.com/account/email). Optionally add a `redirect=` URL parameter to return users to your app after successfully updating.',
      tooltips: {
        email: 'Update your primary email address',
        phone: 'Update your primary phone number',
        username: 'Update your username',
        password: 'Set a new password',
        authenticator_app: 'Set up a new authenticator app for multi-factor authentication',
        passkey_add: 'Register a new passkey',
        passkey_manage: 'Manage your existing passkeys or add new ones',
        backup_codes_generate: 'Generate a new set of 10 backup codes',
        backup_codes_manage: 'View your available backup codes or generate new ones',
      },
      customize_note: "Don't want the out-of-the-box experience? You can fully",
      customize_link: 'customize your flows with the Account API instead.',
    },
  },
  sign_up_and_sign_in,
  content,
  setup_warning: {
    no_connector_sms:
      'No SMS connector set-up yet. Before completing the configuration, users will not be able to sign in with this method. <a>{{link}}</a> in "Connectors"',
    no_connector_email:
      'No email connector set-up yet. Before completing the configuration, users will not be able to sign in with this method. <a>{{link}}</a> in "Connectors"',
    no_connector_social:
      'You haven\'t set up any social connector yet. Add connectors first to apply social sign-in methods. <a>{{link}}</a> in "Connectors".',
    no_connector_email_account_center:
      'No email connector set-up yet. Set up in <a>"Email and SMS connectors"</a>.',
    no_connector_sms_account_center:
      'No SMS connector set-up yet. Set up in <a>"Email and SMS connectors"</a>.',
    no_connector_social_account_center:
      'No social connector set-up yet. Set up in <a>"Social connectors"</a>.',
    no_mfa_factor: 'No MFA factor set-up yet. Set up in <a>{{link}}</a>.',
    setup_link: 'Set up',
  },
  save_alert: {
    description:
      'You are implementing new sign-in and sign-up procedures. All of your users may be affected by the new set-up. Are you sure to commit to the change?',
    before: 'Before',
    after: 'After',
    sign_up: 'Sign-up',
    sign_in: 'Sign-in',
    social: 'Social',
    forgot_password_migration_notice:
      "We've upgraded forgot password verification to support custom methods. Previously, this was automatically determined by your Email and SMS connectors. Click <strong>Confirm</strong> to complete the upgrade.",
  },
  preview: {
    title: 'Sign-in preview',
    live_preview: 'Live preview',
    live_preview_tip: 'Save to preview changes',
    native: 'Native',
    desktop_web: 'Desktop Web',
    mobile_web: 'Mobile Web',
    desktop: 'Desktop',
    mobile: 'Mobile',
  },
  custom_profile_fields,
};

export default Object.freeze(sign_in_exp);
