const tenants = {
  title: 'Settings',
  description: 'Efficiently manage tenant settings and customize your domain.',
  tabs: {
    settings: 'Settings',
    domains: 'Domains',
    subscription: 'Plan and billing',
    billing_history: 'Billing history',
  },
  settings: {
    title: 'SETTINGS',
    tenant_id: 'Tenant ID',
    tenant_name: 'Tenant Name',
    environment_tag: 'Environment Tag',
    environment_tag_description:
      "Tags don't alter the service. They simply guide you to differentiate various environments.",
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
  create_modal: {
    title: 'Create tenant',
    subtitle: 'Create a new tenant to separate resources and users.',
    create_button: 'Create tenant',
    tenant_name_placeholder: 'My tenant',
  },
  delete_modal: {
    title: 'Delete tenant',
    description_line1:
      'Are you sure you want to delete your tenant "<span>{{name}}</span>" with environment suffix tag "<span>{{tag}}</span>"? This action cannot be undo, and will result in the permanent deletion of all your data and account information.',
    description_line2:
      'Before deleting account, maybe we can help you. <span><a>Contact us via Email</a></span>',
    description_line3:
      'If you would like to proceed, please enter the tenant name "<span>{{name}}</span>" to confirm.',
    delete_button: 'Permanently delete',
  },
  tenant_landing_page: {
    title: "You haven't created a tenant yet",
    description:
      'To start configuring your project with Logto, please create a new tenant. If you need to log out or delete your account, just click on the avatar button in the top right corner.',
    create_tenant_button: 'Create tenant',
  },
  status: {
    mau_exceeded: 'MAU Exceeded',
    suspended: 'Suspended',
    overdue: 'Overdue',
  },
  tenant_suspended_page: {
    title: 'Tenant suspended. Contact us to restore access.',
    description_1:
      'We deeply regret to inform you that your tenant account has been temporarily suspended due to improper use, including exceeding MAU limits, overdue payments, or other unauthorized actions.',
    description_2:
      'If you require further clarification, have any concerns, or wish to restore full functionality and unblock your tenants, please do not hesitate to contact us immediately.',
  },
  signing_keys: {
    title: 'SIGNING KEYS',
    description: 'Securely manage signing keys in your tenant.',
    type: {
      private_key: 'OIDC private keys',
      cookie_key: 'OIDC cookie keys',
    },
    private_keys_in_use: 'Private keys in use',
    rotate_private_keys: 'Rotate private keys',
    rotate_private_keys_description:
      'This will rotate the currently used private keys. Your {{entities}} with previous private keys will stay valid until you delete it.',
    select_private_key_algorithm: 'Select signing key algorithm for private keys',
    rotate_button: 'Rotate',
    table_column: {
      id: 'ID',
      status: 'Status',
      algorithm: 'Signing key algorithm',
    },
    status: {
      current: 'Current',
      previous: 'Previous',
    },
    reminder: {
      rotate:
        'Are you sure you want to rotate the <strong>{{key}}</strong>? This will require all your apps and APIs to use the new signing key. Existing {{entities}} stay valid until you rotate again.',
      delete:
        'Are you sure you want to delete the <strong>{{key}}</strong>? Existing {{entities}} signed with this signing key will no longer be valid.',
    },
    signed_entity: {
      tokens: 'JWT tokens',
      cookies: 'cookies',
    },
  },
};

export default Object.freeze(tenants);
