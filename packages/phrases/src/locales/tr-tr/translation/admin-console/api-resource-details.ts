const api_resource_details = {
  page_title: 'API Kaynak detayları',
  back_to_api_resources: 'API Kaynaklarına geri dön',
  settings_tab: 'Ayarlar',
  permissions_tab: 'İzinler',
  settings: 'Ayarlar',
  settings_description:
    'API kaynakları, Resource göstergeleri olarak da bilinir. Genellikle, kaynağın kimliğini temsil eden bir URI formatındaki değişkeni içerir.',
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
    name: 'İzin adı',
    name_placeholder: 'read:kaynak',
    forbidden_space_in_name: 'İzin adı boşluk içermemelidir.',
    description: 'Açıklama',
    description_placeholder: 'Kaynakları okuyabilir.',
    permission_created: '{{name}} İzni başarıyla oluşturuldu.',
    delete_description:
      'Bu izin silinirse, bu iznin sağladığı erişimi alan kullanıcı da erişimi kaybedecektir.',
    deleted: '"{{name}}" izni başarıyla silindi!',
  },
};

export default api_resource_details;
