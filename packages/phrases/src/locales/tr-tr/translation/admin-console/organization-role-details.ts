const organization_role_details = {
  page_title: 'Kuruluş rolü ayrıntıları',
  back_to_org_roles: 'Organizasyon rollerine geri dön',
  delete_confirm:
    'Bunu yapmak, etkilenen kullanıcılardan bu role ilişkilendirilen izinleri kaldıracak ve organizasyon rolleri, organizasyon üyeleri ve organizasyon izinleri arasındaki ilişkileri silecektir.',
  deleted: 'Kuruluş rolü {{name}} başarıyla silindi.',
  permissions: {
    tab: 'İzinler',
    name_column: 'İzin',
    description_column: 'Açıklama',
    type_column: 'İzin türü',
    type: {
      api: 'API izni',
      org: 'Organizasyon izni',
    },
    assign_permissions: 'İzinleri atama',
    remove_permission: 'İzni kaldır',
    remove_confirmation:
      'Bu izin kaldırılırsa, bu organizasyon rolüne sahip kullanıcı bu izin tarafından verilen erişimi kaybeder.',
    removed: '{{name}} izni bu organizasyon rolünden başarıyla kaldırıldı',
    assign_description:
      'Bu organizasyon içindeki roller için izinleri atayın. Bunlar hem organizasyon izinlerini hem de API izinlerini içerebilir.',
    organization_permissions: 'Organizasyon izinleri',
    api_permissions: 'API izinleri',
    assign_organization_permissions: 'Kuruluş izinleri ata',
    assign_api_permissions: 'API izinleri ata',
  },
  general: {
    tab: 'Genel',
    settings: 'Ayarlar',
    description:
      'Organizasyon rolü, kullanıcılara atanabilecek izinlerin bir gruplandırılmasıdır. İzinler, önceden tanımlanmış organizasyon izinlerinden ve API izinlerinden gelebilir.',
    name_field: 'Adı',
    description_field: 'Açıklama',
    description_field_placeholder: 'Yalnızca görüntüleme izinlerine sahip kullanıcılar',
  },
};

export default Object.freeze(organization_role_details);
