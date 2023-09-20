const role_details = {
  back_to_roles: '返回角色',
  identifier: '标识符',
  delete_description:
    '这样做将从受影响的用户中删除与该角色关联的权限，并删除角色、用户和权限之间的映射关系。',
  role_deleted: '{{name}} 已成功删除。',
  settings_tab: '设置',
  users_tab: '用户',
  /** UNTRANSLATED */
  m2m_apps_tab: 'Machine-to-machine apps',
  permissions_tab: '权限',
  settings: '设置',
  settings_description:
    '角色是一组权限，可以分配给用户。它们还提供了一种聚合不同 API 定义的权限的方法，使得添加、删除或调整权限比将其单独分配给用户更有效率。',
  field_name: '名称',
  field_description: '描述',
  /** UNTRANSLATED */
  type_m2m_role_tag: 'Machine-to-machine app role',
  /** UNTRANSLATED */
  type_user_role_tag: 'User role',
  permission: {
    assign_button: '分配权限',
    assign_title: '分配权限',
    assign_subtitle: '将权限分配给此角色。角色将获得添加的权限，具有此角色的用户将继承这些权限。',
    assign_form_field: '分配权限',
    added_text_one: '添加了 {{count, number}} 个权限',
    added_text_other: '添加了 {{count, number}} 个权限',
    api_permission_count_one: '{{count, number}} 个权限',
    api_permission_count_other: '{{count, number}} 个权限',
    confirm_assign: '分配权限',
    permission_assigned: '所选的权限已成功分配给此角色',
    deletion_description: '如果删除此权限，则具有此角色的受影响用户将失去此权限授予的访问权限。',
    permission_deleted: '权限 {{name}} 已成功从此角色中删除',
    empty: '无可用权限',
  },
  users: {
    assign_button: '分配用户',
    name_column: '用户',
    app_column: '应用',
    latest_sign_in_column: '最近登录',
    delete_description: '它将保留在你的用户池中，但失去此角色的授权。',
    deleted: '{{name}} 已成功从此角色中删除',
    assign_title: '分配用户',
    assign_subtitle: '将用户分配给此角色。通过搜索名称、电子邮件、电话或用户 ID 查找适当的用户。',
    assign_users_field: '分配用户',
    confirm_assign: '分配用户',
    users_assigned: '所选的用户已成功分配给此角色',
    empty: '无可用用户',
  },
  applications: {
    /** UNTRANSLATED */
    assign_button: 'Assign applications',
    /** UNTRANSLATED */
    name_column: 'Application',
    /** UNTRANSLATED */
    app_column: 'Apps',
    /** UNTRANSLATED */
    description_column: 'Description',
    /** UNTRANSLATED */
    delete_description:
      'It will remain in your application pool but lose the authorization for this role.',
    /** UNTRANSLATED */
    deleted: '{{name}} was successfully removed from this role',
    /** UNTRANSLATED */
    assign_title: 'Assign apps',
    /** UNTRANSLATED */
    assign_subtitle:
      'Assign applications to this role. Find appropriate applications by searching name, description or app ID.',
    /** UNTRANSLATED */
    assign_applications_field: 'Assign applications',
    /** UNTRANSLATED */
    confirm_assign: 'Assign applications',
    /** UNTRANSLATED */
    applications_assigned: 'The selected applications were successfully assigned to this role',
    /** UNTRANSLATED */
    empty: 'No application available',
  },
};

export default Object.freeze(role_details);
