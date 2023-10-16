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
    cannot_delete_title: 'Cannot delete this tenant',
    cannot_delete_description:
      "Sorry, you can't delete this tenant right now. Please make sure you're on the Free Plan and have paid all outstanding billings.",
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
    cookie_keys_in_use: 'Cookie keys in use',
    rotate_private_keys: 'Rotate private keys',
    rotate_cookie_keys: 'Rotate cookie keys',
    rotate_private_keys_description:
      'This action will create a new private signing key, rotate the current key, and remove your previous key. Your JWT tokens signed with the current key will remain valid until deletion or another round of rotation.',
    rotate_cookie_keys_description:
      'This action will create a new cookie key, rotate the current key, and remove your previous key. Your cookies with the current key will remain valid until deletion or another round of rotation.',
    select_private_key_algorithm: 'Select signing key algorithm for the new private key',
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
      rotate_private_key:
        'Are you sure you want to rotate the <strong>OIDC private keys</strong>? New issued JWT tokens will be signed by the new key. Existing JWT tokens stay valid until you rotate again.',
      rotate_cookie_key:
        'Are you sure you want to rotate the <strong>OIDC cookie keys</strong>? New cookies generated in sign-in sessions will be signed by the new cookie key. Existing cookies stay valid until you rotate again.',
      delete_private_key:
        'Are you sure you want to delete the <strong>OIDC private key</strong>? Existing JWT tokens signed with this private signing key will no longer be valid.',
      delete_cookie_key:
        'Are you sure you want to delete the <strong>OIDC cookie key</strong>? Older sign-in sessions with cookies signed with this cookie key will no longer be valid. A re-authentication is required for these users.',
    },
    messages: {
      rotate_key_success: 'Signing keys rotated successfully.',
      delete_key_success: 'Key deleted successfully.',
    },
  },
};

export default Object.freeze(tenants);
