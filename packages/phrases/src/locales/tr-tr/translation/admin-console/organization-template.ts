const organization_template = {
  title: 'Organizasyon şablonu',
  subtitle:
    'Çok kiracılı SaaS uygulamalarında, birden fazla organizasyonun aynı erişim kontrol politikalarını, izinleri ve rolleri dahil olmak üzere paylaşması yaygındır. Logto\'da bu kavram "organizasyon şablonu" olarak adlandırılır. Bunu kullanmak, yetkilendirme modelinizi oluşturma ve tasarlama sürecini basitleştirir.',
  roles: {
    tab_name: 'Org rolleri',
    search_placeholder: 'Role adı ile ara',
    create_title: 'Org rolü oluştur',
    role_column: 'Org rolü',
    permissions_column: 'İzinler',
    placeholder_title: 'Organizasyon rolü',
    placeholder_description:
      'Organizasyon rolü, kullanıcılara atanabilecek izinlerin bir gruplamasıdır. İzinler, önceden belirlenmiş organizasyon izinlerinden gelmelidir.',
    create_modal: {
      title: 'Kuruluş rolü oluştur',
      create: 'Rol oluştur',
      name_field: 'Rol adı',
      description_field: 'Açıklama',
      created: 'Kuruluş rolü {{name}} başarıyla oluşturuldu.',
    },
  },
  permissions: {
    tab_name: 'Org izinleri',
    search_placeholder: 'İzin adı ile ara',
    create_org_permission: 'Org izni oluştur',
    permission_column: 'İzin',
    description_column: 'Açıklama',
    placeholder_title: 'Organizasyon izni',
    placeholder_description:
      'Organizasyon izni, organizasyon bağlamında bir kaynağa erişim yetkisi anlamına gelir.',
    delete_confirm:
      'Bu izin silinirse, bu izni içeren tüm organizasyon rolleri bu izni kaybeder ve bu izne sahip kullanıcılar, bu izin tarafından verilen erişimi kaybeder.',
    create_title: 'Organizasyon izni oluştur',
    edit_title: 'Organizasyon iznini düzenle',
    permission_field_name: 'İzin adı',
    description_field_name: 'Açıklama',
    description_field_placeholder: 'Randevu geçmişini oku',
    create_permission: 'İzin oluştur',
    created: 'Kuruluş izni {{name}} başarıyla oluşturuldu.',
  },
};

export default Object.freeze(organization_template);
