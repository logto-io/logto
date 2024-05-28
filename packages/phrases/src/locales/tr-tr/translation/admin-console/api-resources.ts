const api_resources = {
  page_title: 'API Kaynakları',
  title: 'API Kaynakları',
  subtitle: "Yetkili uygulamalarınızdan kullanabileceğiniz API'leri tanımlayınız",
  create: 'API Kaynağı oluştur',
  api_name: 'API Adı',
  api_name_placeholder: 'API adını giriniz',
  api_identifier: 'API Identifier',
  api_identifier_placeholder: 'https://your-api-identifier/',
  api_identifier_tip:
    'Api kaynağına özgün belirteç. Mutlak URI olmalı ve parça bileşeni (#) içermemeli. OAuth 2.0deki <a>kaynak parametresine</a> eşittir.',
  default_api: 'Varsayılan API',
  default_api_label:
    'Mandant başına sadece sıfır veya bir varsayılan API ayarlanabilir. Varsayılan bir API belirlendiğinde, auth isteğindeki kaynak parametresi çıkarılabilir. Sonraki token değişimlerinde varsayılan olarak bu API hedef alınarak JWTler oluşturulur. <a>Daha fazla bilgi edinin</a>',
  api_resource_created: '{{name}} API kaynağı başarıyla oluşturuldu',
  invalid_resource_indicator_format: 'API indicator must be a valid absolute URI.',
};

export default Object.freeze(api_resources);
