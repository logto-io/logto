const applications = {
  page_title: 'Applications',
  title: 'Applications',
  subtitle: 'Create and manage applications for OIDC authentication.',
  subtitle_with_app_type: 'Set up Logto authentication for your {{name}} application',
  create_device_flow_description:
    'Create a native application that uses the OAuth 2.0 Device Authorization Grant for input-limited devices or headless apps.',
  create: 'Create application',
  create_third_party: 'Create third-party application',
  create_thrid_party_modal_title: 'Create a third-party app ({{type}})',
  application_name: 'Application name',
  application_name_placeholder: 'My App',
  application_description: 'Application description',
  application_description_placeholder: 'Enter your application description',
  select_application_type: 'Select an application type',
  no_application_type_selected: 'You haven’t selected any application type yet',
  application_created: 'Application created successfully.',
  tab: {
    my_applications: 'My apps',
    third_party_applications: 'Third-party apps',
  },
  app_id: 'App ID',
  type: {
    native: {
      title: 'Native App',
      subtitle: 'An app that runs in a native environment',
      description: 'E.g., iOS app, Android app, desktop app, TVs, CLI',
    },
    spa: {
      title: 'Single Page App',
      subtitle: 'An app that runs in a web browser and dynamically updates data in place',
      description: 'E.g., React DOM app, Vue app',
    },
    traditional: {
      title: 'Traditional Web',
      subtitle: 'An app that renders and updates pages by the web server alone',
      description: 'E.g., Next.js, PHP',
    },
    machine_to_machine: {
      title: 'Machine-to-Machine',
      subtitle: 'An app (usually a service) that directly talks to resources',
      description: 'E.g., Backend service',
    },
    protected: {
      title: 'Protected App',
      subtitle: 'An app that is protected by Logto', // Not in use
      description: 'N/A', // Not in use
    },
    saml: {
      title: 'SAML App',
      subtitle: 'An app that is used as an SAML IdP connector',
      description: 'E.g., SAML',
    },
    third_party: {
      title: 'Third-party App',
      subtitle: 'An app that is used as a third-party IdP connector',
      description: 'E.g., OIDC',
    },
  },
  authorization_flow: {
    title: 'Authorization flow',
    tooltip:
      'Select the authorization flow for your application. Once set, this cannot be changed.',
    authorization_code: {
      title: 'Authorization code',
      description:
        'The default and most common grant type. Users are redirected to a sign-in page to authorize access directly.',
    },
    device_flow: {
      title: 'Device flow',
      description:
        'For input-limited devices or headless apps (e.g., TVs, CLI). Users complete login on a separate device by entering a device code or scanning a QR code.',
    },
  },
  placeholder_title: 'Select an application type to continue',
  placeholder_description:
    'Logto uses an application entity for OIDC to help with tasks such as identifying your apps, managing sign-in, and creating audit logs.',
  third_party_application_placeholder_description:
    'Use Logto as an Identity Provider to provide OAuth authorization to third-party services. Includes a prebuilt user consent screen for resource access. <a>Learn more</a>',
  dynamic_app: {
    title: 'Dynamic app',
    subtitle: 'CIMD',
    description: 'Dynamic app allows OAuth clients to connect without pre-registration.',
    settings_description:
      'Dynamic app allows OAuth clients to connect without pre-registration. Uses the OAuth Client ID Metadata Document (CIMD) specification.',
    beta_notice:
      'Dynamic app is currently in beta. Welcome to explore it and <ContactLink>share your feedback</ContactLink>.',
    app_id_placeholder: 'Provided dynamically by each client',
    enable_confirm_modal: {
      title: 'Enable dynamic client access?',
      content:
        'Any OAuth client with a valid public HTTPS client ID URL can initiate authorization for this tenant without pre-registration. Access remains limited by your maximum permissions and user consent.',
      beta_pricing_notice:
        "Dynamic app is free to use while in beta. Add-on pricing may apply after beta. We'll notify you in advance, and you can turn it off at any time.",
    },
    enabled: 'Dynamic app enabled successfully.',
    disable_confirm_modal: {
      title: 'Disable dynamic app?',
      content:
        'CIMD clients will no longer be able to start new authorization requests. Existing grants will be retained, and issued access tokens may remain valid until they expire.',
    },
    disabled: 'Dynamic app disabled successfully.',
    permissions: {
      user_title: 'User',
      user_description:
        'Select the permissions requested by OAuth clients for accessing specific user data.',
      grant_user_level_permissions: 'Grant user permissions',
      organization_title: 'Organization',
      organization_description:
        'Select the permissions requested by OAuth clients for accessing specific organization data.',
      grant_organization_level_permissions: 'Grant organization permissions',
      permission_delete_confirm:
        'This action will remove the permission from the dynamic app, preventing OAuth clients from requesting user authorization for it. Are you sure you want to continue?',
    },
  },
  guide: {
    third_party: {
      title: 'Integrate a third-party application',
      description:
        'Use Logto as your Identity Provider to provide OAuth authorization to third-party services. Includes a prebuilt user consent screen for secure resource access. <a>Learn more</a>',
    },
  },
};

export default Object.freeze(applications);
