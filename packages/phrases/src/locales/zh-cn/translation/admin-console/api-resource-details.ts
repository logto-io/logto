const api_resource_details = {
  page_title: 'API 资源详情',
  back_to_api_resources: '返回 API 资源',
  general_tab: '常规',
  permissions_tab: '权限',
  settings: '设置',
  settings_description:
    'API 资源，又称资源指示器，表示要请求的目标服务或资源，通常是表示资源身份的 URI 格式变量。',
  management_api_settings_description:
    'Logto 管理 API 是一组全面的 API，使管理员能够管理各种与身份相关的任务，执行安全策略并遵守法规和标准。',
  management_api_notice:
    '该 API 代表 Logto 实体，无法修改或删除。你可以使用管理 API 来执行范围广泛的与身份相关的任务。 <a>了解更多</a>',
  token_expiration_time_in_seconds: 'Token 过期时间（秒）',
  token_expiration_time_in_seconds_placeholder: '请输入你的 token 过期时间',
  delete_description:
    '本操作会永久性地删除该 API 资源，且不可撤销。输入 API 资源名称 <span>{{name}}</span> 确认。',
  enter_your_api_resource_name: '输入 API 资源名称',
  api_resource_deleted: ' API 资源 {{name}} 已删除.',
  permission: {
    create_button: '创建权限',
    create_title: '创建权限',
    create_subtitle: '定义此 API 所需的权限 (scope)。',
    confirm_create: '创建权限',
    edit_title: '编辑 API 权限',
    edit_subtitle: '定义 {{resourceName}} API 需要的权限（范围）。',
    name: '权限名称',
    name_placeholder: 'read:resource',
    forbidden_space_in_name: '权限名称不能包含空格。',
    description: '描述',
    description_placeholder: '能够读取资源',
    permission_created: '权限 "{{name}}" 已成功创建',
    delete_description: '如果删除此权限，拥有该权限的用户将失去由此权限授予的访问权限。',
    deleted: '成功删除权限 "{{name}}"。',
  },
};

export default Object.freeze(api_resource_details);
