const tenant_settings = {
  title: 'Kiralama Ayarları',
  description:
    'Hesap güvenliğinizi sağlamak için burada hesap ayarlarınızı ve kişisel bilgilerinizi yönetin.',
  tabs: {
    settings: 'Ayarlar',
  },
  profile: {
    title: 'PROFİL AYARI',
    tenant_id: 'Kiracı Kimliği',
    tenant_name: 'Kiracı Adı',
    environment_tag: 'Çevre Etiketi',
    environment_tag_description:
      'Etiketleri kullanarak kiracı kullanım ortamlarını farklılaştırın. Her etiketin içindeki hizmetler aynıdır, tutarlılığı sağlar.',
    environment_tag_development: 'Geliştirme',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Üretim',
  },
};

export default tenant_settings;
