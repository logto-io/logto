const tenants = {
  create_modal: {
    title: 'Create tenant',
    subtitle: 'Create a new tenant to separate resources and users.',
    create_button: 'Create tenant',
    tenant_name: 'Tenant Name',
    tenant_name_placeholder: 'My tenant',
    environment_tag: 'Environment Tag',
    environment_tag_description:
      'Use tags to differentiate tenant usage environments. Services within each tag are identical, ensuring consistency.',
    environment_tag_development: 'Development',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Production',
  },
  tenant_created: "Tenant '{{name}}' created successfully.",
};

export default tenants;
