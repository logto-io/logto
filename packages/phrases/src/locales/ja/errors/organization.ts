const organization = {
  require_membership: 'ユーザーは組織のメンバーである必要があります。',
  role_names_not_found:
    '無効なロール名が検出されました：{{names,list(type:conjunction)}}。これらのロールを作成してから次へ進んでください。',
  invitation_status_not_changeable: '招待のステータスはこれ以上変更できません。',
  accepted_user_id_required: '招待を受け入れるには `acceptedUserId` が必要です。',
  invitee_already_member: '招待されたユーザーはすでに組織のメンバーです。',
  accepted_user_email_mismatch:
    '受け入れるユーザーは招待されたユーザーと同じメールアドレスである必要があります。',
  expires_at_in_future: '`expiresAt` の値は将来である必要があります。',
};

export default Object.freeze(organization);
