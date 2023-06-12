const tenant_settings = {
  title: 'Tenant Settings',
  description:
    'Change your account settings and manage your personal information here to ensure your account security.',
  tabs: {
    settings: 'Settings',
    domains: 'Domains',
  },
  profile: {
    title: 'PROFILE SETTING',
    tenant_id: 'Tenant ID',
    tenant_name: 'Tenant Name',
    environment_tag: 'Environment Tag',
    environment_tag_description:
      'Use tags to differentiate tenant usage environments. Services within each tag are identical, ensuring consistency.',
    environment_tag_development: 'Development',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Production',
  },
  deletion_card: {
    title: 'DELETE',
    tenant_deletion: 'Delete tenant',
    tenant_deletion_description:
      'Deleting your account will remove all of your personal information, user data, and configuration. This action cannot be undone.',
    tenant_deletion_button: 'Delete tenant',
  },
};

export default tenant_settings;
