const tenants = {
  create_modal: {
    title: 'Kiracı Oluştur',
    subtitle: 'Kaynakları ve kullanıcıları ayırmak için yeni bir kiracı oluşturun.',
    create_button: 'Kiracı oluştur',
    tenant_name: 'Kiracı Adı',
    tenant_name_placeholder: 'Benim kiracım',
    environment_tag: 'Çevre Etiketi',
    environment_tag_description:
      'Kiracı kullanım ortamlarını ayırt etmek için etiketleri kullanın. Her etiket içindeki hizmetler aynıdır, tutarlılığı sağlar.',
    environment_tag_development: 'Geliştirme',
    environment_tag_staging: 'Daha Yüksek Birlik',
    environment_tag_production: 'Üretim',
  },
  tenant_created: "Kiracı '{{name}}' başarıyla oluşturuldu.",
};

export default tenants;
