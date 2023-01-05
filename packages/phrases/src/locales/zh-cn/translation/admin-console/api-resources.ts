const api_resources = {
  title: 'API 资源',
  subtitle: '定义可以从已授权的应用程序中使用的 API',
  create: '创建 API 资源',
  api_name: 'API 名称',
  api_name_placeholder: '输入API名称',
  api_identifier: 'API Identifier',
  api_identifier_placeholder: 'https://your-api-identifier/',
  api_identifier_tip:
    '对于 API 资源的唯一标识符。它必须是一个绝对 URI 并没有 fragment (#) 组件。等价于 OAuth 2.0 中的 <a>resource parameter</a>。',
  api_resource_created: ' API 资源 {{name}} 已成功创建！',
  create_permission_button: 'Create Permission', // UNTRANSLATED
  create_permission_title: 'Create permission', // UNTRANSLATED
  create_permission_subtitle: 'Define the permissions (scopes) needed by this API.', // UNTRANSLATED
  confirm_create_permission: 'Create permission', // UNTRANSLATED
  permission_field: 'Permission name', // UNTRANSLATED
  permission_field_placeholder: 'Read: Resources', // UNTRANSLATED
  description_field: 'Description', // UNTRANSLATED
  description_field_placeholder: 'Able to read the resources', // UNTRANSLATED
  permission_created: 'The permission {{name}} has been successfully created', // UNTRANSLATED
  permission_column: 'Permission', // UNTRANSLATED
  description_column: 'Description', // UNTRANSLATED
};

export default api_resources;
