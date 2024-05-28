const api_resource_details = {
  page_title: 'API Kaynak detayları',
  back_to_api_resources: 'API Kaynaklarına geri dön',
  general_tab: 'Genel',
  permissions_tab: 'İzinler',
  settings: 'Ayarlar',
  settings_description:
    'API kaynakları, Resource göstergeleri olarak da bilinir. Genellikle, kaynağın kimliğini temsil eden bir URI formatındaki değişkeni içerir.',
  management_api_settings_description:
    "Logto Yönetim API'si, yöneticilerin kimlikle ilgili birçok görevi yönetmelerine, güvenlik politikalarını uygulamalarına ve yönetmeliklere ve standartlara uyum sağlamalarına olanak tanıyan kapsamlı bir API koleksiyonudur.",
  management_api_notice:
    "Bu API Logto varlığını temsil eder ve değiştirilemez veya silinemez. Geniş bir kimlikle ilgili görevler yelpazesi için yönetim API'sini kullanabilirsiniz. <a>Daha fazla bilgi</a>",
  token_expiration_time_in_seconds: 'Token sona erme süresi (saniye)',
  token_expiration_time_in_seconds_placeholder: 'Token zaman aşım süresini giriniz',
  delete_description:
    'Bu eylem geri alınamaz. API kaynakları kalıcı olarak silinecektir. Lütfen onaylamak için API kaynak adını <span>{{name}}</span> giriniz.',
  enter_your_api_resource_name: 'API kaynak adını giriniz.',
  api_resource_deleted: '{{name}} API kaynağı başarıyla silindi',
  permission: {
    create_button: 'İzin Oluştur',
    create_title: 'İzin Oluştur',
    create_subtitle: 'Bu API tarafından gerektirilen izinleri (kapsamları) tanımlayın.',
    confirm_create: 'İzin Oluştur',
    edit_title: 'API iznini düzenle',
    edit_subtitle: 'API tarafından gereken izinleri (kapsamları) tanımlayın.',
    name: 'İzin adı',
    name_placeholder: 'read:kaynak',
    forbidden_space_in_name: 'İzin adı boşluk içermemelidir.',
    description: 'Açıklama',
    description_placeholder: 'Kaynakları okuyabilir.',
    permission_created: '{{name}} İzni başarıyla oluşturuldu.',
    delete_description:
      'Bu izin silinirse, bu iznin sağladığı erişimi alan kullanıcı da erişimi kaybedecektir.',
    deleted: '"{{name}}" izni başarıyla silindi.',
  },
};

export default Object.freeze(api_resource_details);
