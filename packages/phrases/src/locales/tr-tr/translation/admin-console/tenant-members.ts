const tenant_members = {
  members: 'Üyeler',
  invitations: 'Davetiyeler',
  invite_members: 'Üyeleri davet et',
  user: 'Kullanıcı',
  roles: 'Roller',
  admin: 'Yönetici',
  collaborator: 'İşbirlikçi',
  invitation_status: 'Davet durumu',
  inviter: 'Davet eden',
  expiration_date: 'Son kullanma tarihi',
  invite_modal: {
    title: "Silverhand'e Kişileri Davet Et",
    subtitle: 'Bir kuruluşa üye davet etmek için daveti kabul etmeleri gerekmektedir.',
    to: 'Kime',
    added_as: 'Şu rollerle eklendi',
    email_input_placeholder: 'johndoe@example.com',
  },
  invitation_statuses: {
    pending: 'Beklemede',
    accepted: 'Kabul edildi',
    expired: 'Süresi doldu',
    revoked: 'İptal Edildi',
  },
  invitation_empty_placeholder: {
    title: 'Takım üyelerini davet et',
    description:
      'Kurumunuz şu anda davet edilen üyesi bulunmamaktadır.\nEntegrasyonunuzda yardımcı olmak için daha fazla üye veya yönetici eklemeyi düşünün.',
  },
  menu_options: {
    edit: 'Kullanıcı rolünü düzenle',
    delete: 'Kullanıcıyı kiracıdan kaldır',
    resend_invite: 'Daveti tekrar gönder',
    revoke: 'Daveti iptal et',
    delete_invitation_record: 'Bu davet kaydını sil',
  },
  edit_modal: {
    title: "{{name}}'in rollerini değiştir",
  },
  delete_user_confirm: 'Bu kullanıcıyı kiracıdan kaldırmak istediğinizden emin misiniz?',
  assign_admin_confirm:
    'Seçilen kullanıcı(ları) yönetici yapmak istediğinizden emin misiniz? Yönetici erişimi vermek aşağıdaki izinleri verecektir.<ul><li>Kiracı fatura planını değiştirme</li><li>İşbirlikçileri ekleme veya kaldırma</li><li>Kiracıyı silme</li></ul>',
  revoke_invitation_confirm: 'Bu daveti iptal etmek istediğinizden emin misiniz?',
  delete_invitation_confirm: 'Bu davet kaydını silmek istediğinizden emin misiniz?',
  messages: {
    invitation_sent: 'Davet gönderildi.',
    invitation_revoked: 'Davet iptal edildi.',
    invitation_resend: 'Davet tekrar gönderildi.',
    invitation_deleted: 'Davet kaydı silindi.',
  },
  errors: {
    email_required: 'Davet edilen e-posta gerekli.',
    email_exists: 'E-posta adresi zaten mevcut.',
    member_exists: 'Bu kullanıcı zaten bu kuruluşun bir üyesidir.',
    pending_invitation_exists:
      'Bekleyen davet mevcut. İlgili e-postayı silin veya daveti iptal edin.',
    invalid_email: 'E-posta adresi geçersiz. Lütfen doğru formatta olduğundan emin olun.',
    max_member_limit: 'Bu kiracı için maksimum üye sayısına ulaştınız ({{limit}}).',
  },
};

export default Object.freeze(tenant_members);
