const organization = {
  require_membership: '用户必须是组织的成员才能继续。',
  role_names_not_found:
    '检测到无效的角色名称：{{names,list(type:conjunction)}}。请先创建这些角色，然后再继续。',
  invitation_status_not_changeable: '邀请状态不能再更改。',
  accepted_user_id_required: '接受邀请时必须提供 `acceptedUserId`。',
  invitee_already_member: '受邀者已经是该组织的成员。',
  accepted_user_email_mismatch: '接受邀请的用户必须与受邀者邮箱一致。',
  expires_at_in_future: '`expiresAt` 的值必须在未来。',
};

export default Object.freeze(organization);
