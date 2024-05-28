const tenant_members = {
  members: '成員',
  invitations: '邀請',
  invite_members: '邀請成員',
  user: '用戶',
  roles: '角色',
  admin: '管理員',
  collaborator: '協作者',
  invitation_status: '邀請狀態',
  inviter: '邀請者',
  expiration_date: '到期日期',
  invite_modal: {
    title: '邀請人加入 Silverhand',
    subtitle: '要邀請組織成員，他們必須接受邀請。',
    to: '到',
    added_as: '被添加為角色',
    email_input_placeholder: 'johndoe@example.com',
  },
  invitation_statuses: {
    pending: '待定',
    accepted: '已接受',
    expired: '已過期',
    revoked: '已撤銷',
  },
  invitation_empty_placeholder: {
    title: '邀請團隊成員',
    description: '您的租戶目前沒有被邀請的成員。\n為了協助您的整合，請考慮添加更多成員或管理員。',
  },
  menu_options: {
    edit: '編輯租戶角色',
    delete: '從租戶中移除用戶',
    resend_invite: '重新發送邀請',
    revoke: '撤銷邀請',
    delete_invitation_record: '刪除此邀請記錄',
  },
  edit_modal: {
    title: '更改 {{name}} 的角色',
  },
  delete_user_confirm: '您確定要從此租戶中刪除此用戶嗎？',
  assign_admin_confirm:
    '您確定要將所選用戶設為管理員嗎？授予管理員訪問權限將賦予用戶如下權限。<ul><li>更改租戶計費計劃</li><li>添加或移除協作者</li><li>刪除租戶</li></ul>',
  revoke_invitation_confirm: '您確定要撤銷此邀請嗎？',
  delete_invitation_confirm: '您確定要刪除此邀請記錄嗎？',
  messages: {
    invitation_sent: '已發送邀請。',
    invitation_revoked: '邀請已撤銷。',
    invitation_resend: '邀請已重新發送。',
    invitation_deleted: '邀請記錄已刪除。',
  },
  errors: {
    email_required: '需要邀請者的電子郵件。',
    email_exists: '電子郵件地址已經存在。',
    member_exists: '此用戶已經是此組織的成員。',
    pending_invitation_exists: '存在待定的邀請。請刪除相關郵件或撤銷邀請。',
    invalid_email: '電子郵件地址無效。請確保其格式正確。',
    max_member_limit: '您已達到此租戶的最大成員數量（{{limit}}）。',
  },
};

export default Object.freeze(tenant_members);
