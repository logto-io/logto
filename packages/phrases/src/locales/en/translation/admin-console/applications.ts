const applications = {
  page_title: 'Applications',
  title: 'Applications',
  subtitle: 'Create and manage applications for OIDC authentication.',
  subtitle_with_app_type: 'Set up Logto authentication for your {{name}} application',
  create: 'Create application',
  create_subtitle_third_party:
    'Use Logto as your identity provider (IdP) to easily integrate with third-party applications',
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
      description: 'E.g., iOS app, Android app',
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
    third_party: {
      title: 'Third-party App',
      subtitle: 'An app that is used as a third-party IdP connector',
      description: 'E.g., OIDC, SAML',
    },
  },
  placeholder_title: 'Select an application type to continue',
  placeholder_description:
    'Logto uses an application entity for OIDC to help with tasks such as identifying your apps, managing sign-in, and creating audit logs.',
  m2m_role_assignment: {
    title: 'Authorize app with machine-to-machine role for permissions',
    subtitle: 'Machine-to-machine applications require authorized machine-to-machine role.',
    role_creation_hint:
      'Can’t find the right machine-to-machine role? <a>Create a machine-to-machine role</a>',
  },
};

export default Object.freeze(applications);
