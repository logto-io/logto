const api_resource_details = {
  back_to_api_resources: '返回 API 资源',
  settings_tab: 'Settings', // UNTRANSLATED
  permission_tab: 'Permission', // UNTRANSLATED
  settings: '设置',
  settings_description:
    'API resources, a.k.a. Resource Indicators, indicate the target services or resources to be requested, usually, a URI format variable representing the resource‘s identity.', // UNTRANSLATED
  token_expiration_time_in_seconds: 'Token 过期时间（秒）',
  token_expiration_time_in_seconds_placeholder: '请输入你的 token 过期时间',
  delete_description:
    '本操作会永久性地删除该 API 资源，且不可撤销。输入 API 资源名称 <span>{{name}}</span> 确认。',
  enter_your_api_resource_name: '输入 API 资源名称',
  api_resource_deleted: ' API 资源 {{name}} 已删除.',
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
