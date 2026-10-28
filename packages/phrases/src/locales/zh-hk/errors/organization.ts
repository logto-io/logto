const organization = {
  require_membership: '用戶必須是組織的成員才能繼續。',
  role_names_not_found:
    '檢測到無效的角色名稱：{{names,list(type:conjunction)}}。請先創建這些角色再繼續。',
  invitation_status_not_changeable: '邀請狀態不能再更改。',
  accepted_user_id_required: '接受邀請時必須提供 `acceptedUserId`。',
  invitee_already_member: '受邀者已經是該組織的成員。',
  accepted_user_email_mismatch: '接受邀請的用戶必須與受邀者電郵一致。',
  expires_at_in_future: '`expiresAt` 的值必須在未來。',
};

export default Object.freeze(organization);
