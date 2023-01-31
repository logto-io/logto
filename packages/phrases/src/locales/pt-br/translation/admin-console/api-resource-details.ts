const api_resource_details = {
  back_to_api_resources: 'Voltar para os recursos da API',
  settings_tab: 'Settings', // UNTRANSLATED
  permissions_tab: 'Permissions', // UNTRANSLATED
  settings: 'Configurações',
  settings_description:
    'Os recursos da API, também conhecidos como Indicadores de recursos, indicam os serviços ou recursos de destino a serem solicitados, geralmente uma variável de formato de URI que representa a identidade do recurso.',
  token_expiration_time_in_seconds: 'Tempo de expiração do token (em segundos)',
  token_expiration_time_in_seconds_placeholder: 'Digite o tempo de expiração do seu token',
  delete_description:
    'Essa ação não pode ser desfeita. Isso excluirá permanentemente o recurso da API. Insira o nome do recurso de API <span>{{name}}</span> para confirmar.',
  enter_your_api_resource_name: 'Digite o nome do recurso da API',
  api_resource_deleted: 'O recurso da API {{name}} foi excluído com sucesso',
  permission: {
    create_button: 'Create Permission', // UNTRANSLATED
    create_title: 'Create permission', // UNTRANSLATED
    create_subtitle: 'Define the permissions (scopes) needed by this API.', // UNTRANSLATED
    confirm_create: 'Create permission', // UNTRANSLATED
    name: 'Permission name', // UNTRANSLATED
    name_placeholder: 'read:resource', // UNTRANSLATED
    forbidden_space_in_name: 'The permission name must not contain any spaces.', // UNTRANSLATED
    description: 'Description', // UNTRANSLATED
    description_placeholder: 'Able to read the resources', // UNTRANSLATED
    permission_created: 'The permission {{name}} has been successfully created', // UNTRANSLATED
    delete_description:
      'If this permission is deleted, the user who had this permission will lose the access granted by it.', // UNTRANSLATED
    deleted: 'The permission "{{name}}" was successfully deleted!', // UNTRANSLATED
  },
};

export default api_resource_details;
