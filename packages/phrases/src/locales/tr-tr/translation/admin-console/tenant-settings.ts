const tenant_settings = {
  title: 'Ayarlar',
  description: 'Kiracı ayarlarını verimli bir şekilde yönetin ve alan adınızı özelleştirin.',
  tabs: {
    settings: 'Ayarlar',
    domains: 'Alan adları',
  },
  settings: {
    title: 'AYARLAR',
    tenant_id: 'Kiracı Kimliği',
    tenant_name: 'Kiracı Adı',
    environment_tag: 'Çevre Etiketi',
    environment_tag_description:
      'Etiketler hizmeti değiştirmez. Sadece farklı ortamları ayırt etmek için rehberlik eder.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: 'Kiracı bilgileri başarıyla kaydedildi.',
  },
  deletion_card: {
    title: 'SİL',
    tenant_deletion: 'Kiracıyı Sil',
    tenant_deletion_description:
      'Kiracının silinmesi, tüm ilişkili kullanıcı verilerinin ve yapılandırmalarının kalıcı olarak silinmesine neden olur. Lütfen dikkatli bir şekilde devam edin.',
    tenant_deletion_button: 'Kiracıyı Sil',
  },
};

export default tenant_settings;
