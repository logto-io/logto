const role_details = {
  back_to_roles: 'Rollere Dön',
  identifier: 'Tanımlayıcı',
  delete_description:
    'Bunu yapmak, rolle ilişkili izinleri etkilenen kullanıcılardan kaldırır ve roller, kullanıcılar ve izinler arasındaki eşleştirmeyi siler.',
  role_deleted: '{{name}} başarıyla silindi!',
  settings_tab: 'Ayarlar',
  users_tab: 'Kullanıcılar',
  permissions_tab: 'İzinler',
  settings: 'Ayarlar',
  settings_description:
    "Roller, kullanıcılara atanabilen izinlerin bir gruplamasıdır. Ayrıca, farklı API'ler için tanımlanan izinleri biriktirmek için bir yol sağladıkları için, izinleri kullanıcılara bireysel olarak atamaktan daha verimli bir şekilde eklemek, kaldırmak veya ayarlamak için bir yoldur.",
  field_name: 'Adı',
  field_description: 'Açıklama',
  permission: {
    assign_button: 'İzinleri Ata',
    assign_title: 'İzinleri Ata',
    assign_subtitle:
      'Bu role izinler atanır. Rol, eklenen izinleri alır ve bu role sahip kullanıcılar bu izinleri devralır.',
    assign_form_field: 'İzinleri Ata',
    added_text_one: '{{count, number}} izin eklendi',
    added_text_other: '{{count, number}} izinler eklendi',
    api_permission_count_one: '{{count, number}} izin',
    api_permission_count_other: '{{count, number}} izinler',
    confirm_assign: 'İzinleri Ata',
    permission_assigned: 'Seçilen izinler bu role başarıyla atandı',
    deletion_description:
      'Bu izin kaldırılırsa, bu role sahip etkilenen kullanıcı sahip olduğu erişimi kaybeder.',
    permission_deleted: 'İzin "{{name}}" bu rol için başarıyla kaldırıldı',
    empty: 'Mevcut izin yok',
  },
  users: {
    assign_button: 'Kullanıcıları Ata',
    name_column: 'Kullanıcı',
    app_column: 'Uygulama',
    latest_sign_in_column: 'Son giriş',
    delete_description: 'Bu rol için yetkilendirme kaybeder ancak kullanıcı havuzunuzda kalır.',
    deleted: '{{name}} bu rolden başarıyla kaldırıldı',
    assign_title: 'Kullanıcılar Ata',
    assign_subtitle:
      'Kullanıcıları bu role atayın. İsim, e-posta, telefon veya kullanıcı kimliği arayarak uygun kullanıcıları bulun.',
    assign_users_field: 'Kullanıcıları Ata',
    confirm_assign: 'Kullanıcıları Ata',
    users_assigned: 'Seçilen kullanıcılar bu role başarıyla atandı',
    empty: 'Mevcut kullanıcı yok',
  },
};

export default role_details;
