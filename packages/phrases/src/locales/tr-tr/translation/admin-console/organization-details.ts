const organization_details = {
  page_title: 'Kuruluş detayları',
  delete_confirmation:
    'Silindiğinde, tüm üyeler bu kuruluştaki üyeliklerini ve rollerini kaybedecek. Bu işlem geri alınamaz.',
  organization_id: 'Kuruluş Kimliği',
  settings_description:
    'Organizasyonlar, uygulamalarınıza erişebilen ekipleri, iş müşterilerini ve iş ortaklarını temsil eder.',
  name_placeholder: 'Kuruluşun adı, benzersiz olması gerekli değildir.',
  description_placeholder: 'Kuruluşun açıklaması.',
  member: 'Üye',
  member_other: 'Üyeler',
  add_members_to_organization: 'Üyeleri "{{name}}" kuruluşuna ekle',
  add_members_to_organization_description:
    'İsim, e-posta, telefon veya kullanıcı kimliği arayarak uygun kullanıcıları bulun. Var olan üyeler arama sonuçlarında gösterilmez.',
  add_with_organization_role: 'Kuruluş rol(ler)i ile ekle',
  user: 'Kullanıcı',
  authorize_to_roles: '"{{name}}"a aşağıdaki rolleri erişim yetkisi verin:',
  edit_organization_roles: 'Kuruluş rollerini düzenle',
  edit_organization_roles_of_user: '"{{name}}"ın kuruluş rollerini düzenle',
  remove_user_from_organization: 'Kullanıcıyı kuruluştan kaldır',
  remove_user_from_organization_description:
    'Kaldırıldığında, kullanıcı bu kuruluşta üyeliğini ve rollerini kaybedecek. Bu işlem geri alınamaz.',
  search_user_placeholder: 'İsim, e-posta, telefon veya kullanıcı kimliği ile ara',
  at_least_one_user: 'En az bir kullanıcı gereklidir.',
  custom_data: 'Özel veri',
  custom_data_tip:
    'Özel veri, kuruluşla ilişkili ek verileri depolamak için kullanılabilen bir JSON nesnesidir.',
  invalid_json_object: 'Geçersiz JSON nesnesi.',
};

export default Object.freeze(organization_details);
