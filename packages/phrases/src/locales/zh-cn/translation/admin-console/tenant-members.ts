const tenant_members = {
  members: '成员',
  invitations: '邀请',
  invite_members: '邀请成员',
  user: '用户',
  roles: '角色',
  admin: '管理员',
  collaborator: '合作者',
  invitation_status: '邀请状态',
  inviter: '邀请者',
  expiration_date: '到期日期',
  invite_modal: {
    title: '邀请人员加入Silverhand',
    subtitle: '要邀请成员加入组织，他们必须接受邀请。',
    to: '至',
    added_as: '作为角色添加',
    email_input_placeholder: 'johndoe@example.com',
  },
  invitation_statuses: {
    pending: '待处理',
    accepted: '已接受',
    expired: '已过期',
    revoked: '已撤销',
  },
  invitation_empty_placeholder: {
    title: '邀请团队成员',
    description: '您的租户当前没有邀请的成员。为了协助您的集成，请考虑添加更多成员或管理员。',
  },
  menu_options: {
    edit: '编辑租户角色',
    delete: '从租户中删除用户',
    resend_invite: '重新发送邀请',
    revoke: '撤销邀请',
    delete_invitation_record: '删除此邀请记录',
  },
  edit_modal: {
    title: '更改{{name}}的角色',
  },
  delete_user_confirm: '您确定要从此租户中删除此用户吗？',
  assign_admin_confirm:
    '您确定要将所选用户设为管理员吗？授予管理员访问权限将为用户提供以下权限。<ul><li>更改租户计费计划</li><li>添加或删除合作者</li><li>删除租户</li></ul>',
  revoke_invitation_confirm: '您确定要撤销此邀请吗？',
  delete_invitation_confirm: '您确定要删除此邀请记录吗？',
  messages: {
    invitation_sent: '已发送邀请。',
    invitation_revoked: '已撤销邀请。',
    invitation_resend: '已重新发送邀请。',
    invitation_deleted: '已删除邀请记录。',
  },
  errors: {
    email_required: '邀请人员的电子邮件地址是必需的。',
    email_exists: '电子邮件地址已存在。',
    member_exists: '此用户已是此组织的成员。',
    pending_invitation_exists: '存在待处理的邀请。删除相关电子邮件或撤销邀请。',
    invalid_email: '电子邮件地址无效。请确保其格式正确。',
    max_member_limit: '您已达到此租户的最大成员数（{{limit}}）。',
  },
};

export default Object.freeze(tenant_members);
