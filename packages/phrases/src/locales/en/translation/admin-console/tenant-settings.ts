const tenant_settings = {
  title: 'Settings',
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
      'The services with different tags are identical. It functions as a suffix to help your team differentiate environments.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: 'Tenant information saved successfully.',
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
