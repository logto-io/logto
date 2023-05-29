const api_resources = {
  page_title: 'API Kaynakları',
  title: 'API Kaynakları',
  subtitle: 'Yetkili uygulamalarınızdan kullanabileceğiniz APIleri tanımlayınız',
  create: 'API Kaynağı oluştur',
  api_name: 'API Adı',
  api_name_placeholder: 'API adını giriniz',
  api_identifier: 'API belirteci',
  api_identifier_tip:
    'Api kaynağına özgün belirteç. Mutlak URI olmalı ve parça bileşeni (#) içermemeli. OAuth 2.0deki <a>kaynak parametresine</a> eşittir.',
  default_api: 'Default API', // UNTRANSLATED
  default_api_label:
    'If the current API Resource is set as the default API for the tenant, while each tenant can have either 0 or 1 default API. When a default API is designated, the resource parameter can be omitted in the auth request. Subsequent token exchanges will use that API as the audience by default, resulting in the issuance of JWTs.', // UNTRANSLATED
  api_resource_created: '{{name}} API kaynağı başarıyla oluşturuldu',
  api_identifier_placeholder: 'https://your-api-identifier/',
};

export default api_resources;
