const organization = {
  require_membership: 'Kullanıcının devam etmek için organizasyonun bir üyesi olması gerekir.',
  role_names_not_found:
    '检测到无效的角色名称：{{names,list(type:conjunction)}}。请先创建这些角色，然后再继续。',
  invitation_status_not_changeable: 'Davetin durumu artık değiştirilemez.',
  accepted_user_id_required: 'Bir daveti kabul ederken `acceptedUserId` gerekli.',
  invitee_already_member: 'Davet edilen kişi zaten organizasyonun bir üyesi.',
  accepted_user_email_mismatch:
    'Kabul eden kullanıcının, davet edilenle aynı e-postaya sahip olması gerekir.',
  expires_at_in_future: '`expiresAt` değeri gelecekte olmalıdır.',
};

export default Object.freeze(organization);
