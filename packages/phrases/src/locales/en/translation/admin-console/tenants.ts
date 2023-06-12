const tenants = {
  create_modal: {
    title: 'Create tenant',
    subtitle: 'Create a new tenant to separate resources and users.',
    create_button: 'Create tenant',
    tenant_name: 'Tenant Name',
    tenant_name_placeholder: 'My tenant',
    environment_tag: 'Environment Tag',
    environment_tag_description:
      'The services with different tags are identical. It functions as a suffix to help your team differentiate environments.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
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
    title: 'You haven’t created a tenant yet',
    description:
      'To start configuring your project with Logto, please create a new tenant. If you need to log out or delete your account, just click on the avatar button in the top right corner.',
    create_tenant_button: 'Create tenant',
  },
  tenant_created: "Tenant '{{name}}' created successfully.",
};

export default tenants;
