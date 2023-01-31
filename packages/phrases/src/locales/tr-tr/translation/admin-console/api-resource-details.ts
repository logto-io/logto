const api_resource_details = {
  back_to_api_resources: 'API Kaynaklarına geri dön',
  settings_tab: 'Settings', // UNTRANSLATED
  permissions_tab: 'Permissions', // UNTRANSLATED
  settings: 'Settings', // UNTRANSLATED
  settings_description:
    'API resources, a.k.a. Resource Indicators, indicate the target services or resources to be requested, usually, a URI format variable representing the resource‘s identity.', // UNTRANSLATED
  token_expiration_time_in_seconds: 'Token sona erme süresi (saniye)',
  token_expiration_time_in_seconds_placeholder: 'Token zaman aşım süresini giriniz',
  delete_description:
    'Bu eylem geri alınamaz. API kaynakları kalıcı olarak silinecektir. Lütfen onaylamak için API kaynak adını <span>{{name}}</span> giriniz.',
  enter_your_api_resource_name: 'API kaynak adını giriniz.',
  api_resource_deleted: '{{name}} API kaynağı başarıyla silindi',
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
