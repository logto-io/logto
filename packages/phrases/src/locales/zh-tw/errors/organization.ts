const organization = {
  require_membership: '使用者必須是該組織的成員才能繼續。',
  role_names_not_found:
    '检测到无效的角色名称：{{names,list(type:conjunction)}}。请先创建这些角色，然后再继续。',
  invitation_status_not_changeable: '邀請狀態不能再更改。',
  accepted_user_id_required: '接受邀請時必須提供 `acceptedUserId`。',
  invitee_already_member: '受邀者已經是該組織的成員。',
  accepted_user_email_mismatch: '接受邀請的使用者必須與受邀者電子郵件一致。',
  expires_at_in_future: '`expiresAt` 的值必須在未來。',
};

export default Object.freeze(organization);
