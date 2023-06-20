const tenant_settings = {
  title: 'Settings',
  description: 'Efficiently manage tenant settings and customize your domain.',
  tabs: {
    settings: 'Settings',
    domains: 'Domains',
  },
  settings: {
    title: 'SETTINGS',
    tenant_id: 'Tenant ID',
    tenant_name: 'Tenant Name',
    environment_tag: 'Environment Tag',
    environment_tag_description:
      'Tags don’t alter the service. They simply guide you to differentiate various environments.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: 'Tenant information saved successfully.',
  },
  deletion_card: {
    title: 'DELETE',
    tenant_deletion: 'Delete tenant',
    tenant_deletion_description:
      'Deleting the tenant will result in the permanent removal of all associated user data and configuration. Please proceed with caution.',
    tenant_deletion_button: 'Delete tenant',
  },
};

export default tenant_settings;
