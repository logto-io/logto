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
      'Farklı etiketlere sahip hizmetler aynıdır. Ortamları ayırt etmek için ekibinize yardımcı olmak için bir sonek görevi görür.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: 'Kiracı bilgileri başarıyla kaydedildi.',
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
