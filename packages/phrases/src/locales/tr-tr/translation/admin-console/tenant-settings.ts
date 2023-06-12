const tenant_settings = {
  title: 'Ayarlar',
  description:
    'Hesap güvenliğinizi sağlamak için burada hesap ayarlarınızı ve kişisel bilgilerinizi yönetin.',
  tabs: {
    settings: 'Ayarlar',
    domains: 'Alan adları',
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
  deletion_card: {
    title: 'SİL',
    tenant_deletion: 'Kiracıyı Sil',
    tenant_deletion_description:
      'Hesabınızı silmek, tüm kişisel bilgilerinizi, kullanıcı verilerinizi ve yapılandırmalarınızı kaldıracaktır. Bu işlem geri alınamaz.',
    tenant_deletion_button: 'Kiracıyı Sil',
  },
};

export default tenant_settings;
