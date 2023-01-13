const api_resource_details = {
  back_to_api_resources: 'Voltar aos recursos API',
  settings_tab: 'Settings', // UNTRANSLATED
  permission_tab: 'Permission', // UNTRANSLATED
  settings: 'Settings', // UNTRANSLATED
  settings_description:
    'API resources, a.k.a. Resource Indicators, indicate the target services or resources to be requested, usually, a URI format variable representing the resource‘s identity.', // UNTRANSLATED
  token_expiration_time_in_seconds: 'Tempo de expiração do token (em segundos)',
  token_expiration_time_in_seconds_placeholder: 'Insira o tempo de expiração do token',
  delete_description:
    'Esta ação não pode ser desfeita. Isso ira eliminar permanentemente o recurso API. Insira o nome do recurso <span>{{name}}</span> para confirmar.',
  enter_your_api_resource_name: 'Digite o nome do recurso API',
  api_resource_deleted: 'O recurso API {{name}} foi eliminado com sucesso',
  permission: {
    create_button: 'Create Permission', // UNTRANSLATED
    create_title: 'Create permission', // UNTRANSLATED
    create_subtitle: 'Define the permissions (scopes) needed by this API.', // UNTRANSLATED
    confirm_create: 'Create permission', // UNTRANSLATED
    name: 'Permission name', // UNTRANSLATED
    name_placeholder: 'Read:Resources', // UNTRANSLATED
    description: 'Description', // UNTRANSLATED
    description_placeholder: 'Able to read the resources', // UNTRANSLATED
    permission_created: 'The permission {{name}} has been successfully created', // UNTRANSLATED
    delete_description:
      'If this permission is deleted, the user who had this permission will lose the access granted by it.', // UNTRANSLATED
    deleted: 'The permission "{{name}}" was successfully deleted!', // UNTRANSLATED
  },
};

export default api_resource_details;
