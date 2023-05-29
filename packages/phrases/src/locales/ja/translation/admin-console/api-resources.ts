const api_resources = {
  page_title: 'API リソース',
  title: 'API リソース',
  subtitle: '承認されたアプリケーションが利用できるAPIを定義',
  create: 'API リソースを作成',
  api_name: 'API 名',
  api_name_placeholder: 'API 名を入力してください',
  api_identifier: 'API 識別子',
  api_identifier_tip:
    'API リソースの一意の識別子です。絶対URIで、フラグメント(#)コンポーネントはありません。OAuth 2.0での<a>resource parameter</a>に等しいです。',
  default_api: 'Default API', // UNTRANSLATED
  default_api_label:
    'If the current API Resource is set as the default API for the tenant, while each tenant can have either 0 or 1 default API. When a default API is designated, the resource parameter can be omitted in the auth request. Subsequent token exchanges will use that API as the audience by default, resulting in the issuance of JWTs.', // UNTRANSLATED
  api_resource_created: 'APIリソース{{name}}が正常に作成されました',
  api_identifier_placeholder: 'https://your-api-identifier/',
};

export default api_resources;
