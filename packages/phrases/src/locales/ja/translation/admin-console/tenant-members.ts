const tenant_members = {
  members: 'メンバー',
  invitations: '招待状',
  invite_members: 'メンバーを招待する',
  user: 'ユーザー',
  roles: 'ロール',
  admin: '管理者',
  collaborator: '共同作業者',
  invitation_status: '招待状のステータス',
  inviter: '招待者',
  expiration_date: '有効期限',
  invite_modal: {
    title: 'Silverhand への招待',
    subtitle: '組織にメンバーを招待するには、招待を受け入れる必要があります。',
    to: 'To',
    added_as: '役割として追加',
    email_input_placeholder: 'johndoe@example.com',
  },
  invitation_statuses: {
    pending: '保留中',
    accepted: '受け入れ済み',
    expired: '期限切れ',
    revoked: '取り消された',
  },
  invitation_empty_placeholder: {
    title: 'チームメンバーを招待',
    description:
      '現在、テナントに招待されたメンバーはいません。\n統合の支援のために、メンバーや管理者を追加するかどうか検討してください。',
  },
  menu_options: {
    edit: 'テナントロールを編集',
    delete: 'テナントからユーザーを削除',
    resend_invite: '招待を再送信',
    revoke: '招待を取り消す',
    delete_invitation_record: 'この招待レコードを削除',
  },
  edit_modal: {
    title: '{{name}} の役割を変更',
  },
  delete_user_confirm: 'このユーザーをこのテナントから削除してもよろしいですか？',
  assign_admin_confirm:
    '選択したユーザーを管理者にすることを確認しますか？ 管理者アクセスを付与すると、次の権限がユーザーに付与されます。<ul><li>テナントの課金プランを変更</li><li>共同作業者の追加または削除</li><li>テナントの削除</li></ul>',
  revoke_invitation_confirm: 'この招待を取り消してもよろしいですか？',
  delete_invitation_confirm: 'この招待レコードを削除してもよろしいですか？',
  messages: {
    invitation_sent: '招待が送信されました。',
    invitation_revoked: '招待が取り消されました。',
    invitation_resend: '招待が再送信されました。',
    invitation_deleted: '招待レコードが削除されました。',
  },
  errors: {
    email_required: '招待対象のメールアドレスは必須です。',
    email_exists: '電子メールアドレスは既に存在します。',
    member_exists: 'このユーザーはすでにこの組織のメンバーです。',
    pending_invitation_exists:
      '保留中の招待が存在します。関連する電子メールを削除するか、招待を取り消してください。',
    invalid_email: 'メールアドレスが無効です。正しい形式であることを確認してください。',
    max_member_limit: 'このテナントの最大メンバー数（{{limit}}）に達しました。',
  },
};

export default Object.freeze(tenant_members);
