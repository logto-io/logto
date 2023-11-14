const organization_details = {
  page_title: '机构详情',
  delete_confirmation:
    '一旦删除，所有成员将失去他们在这个机构中的成员资格和角色。此操作将无法撤销。',
  organization_id: '机构编号',
  settings_description:
    '一个组织是一组具有共同标识符的身份（通常是用户）。每个组织都有自己的成员、角色和权限集合，而这些角色和权限是由组织模板定义的。',
  name_placeholder: '机构名称，不需要是唯一的。',
  description_placeholder: '机构的描述。',
  member: '成员',
  member_other: '成员',
  add_members_to_organization: '向机构{{name}}添加成员',
  add_members_to_organization_description:
    '通过姓名、电子邮件、电话或用户ID搜索合适的用户。搜索结果中不显示现有成员。',
  add_with_organization_role: '以机构角色加入',
  user: '用户',
  authorize_to_roles: '授权{{name}}访问以下角色:',
  edit_organization_roles: '编辑机构角色',
  edit_organization_roles_of_user: '编辑{{name}}的机构角色',
  remove_user_from_organization: '从机构中移除用户',
  remove_user_from_organization_description:
    '一旦移除，用户将失去他们在这个机构中的成员资格和角色。此操作将无法撤销。',
  search_user_placeholder: '按名称、电子邮件、电话或用户ID搜索',
  at_least_one_user: '至少需要一个用户。',
};

export default Object.freeze(organization_details);
