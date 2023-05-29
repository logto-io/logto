const api_resources = {
  page_title: 'API 리소스',
  title: 'API 리소스',
  subtitle: '인증된 어플리케이션에서 사용될 API를 정의해주세요.',
  create: 'API 리소스 생성',
  api_name: 'API 이름',
  api_name_placeholder: 'API 이름 입력',
  api_identifier: 'API 식별자',
  api_identifier_tip:
    'API 리소스에 대한 고유한 식별자예요. 절대 URI여야 하며 조각 (#) 컴포넌트가 없어야 해요. OAuth 2.0의 <a>resource parameter</a>와 같아요.',
  default_api: 'Default API', // UNTRANSLATED
  default_api_label:
    'If the current API Resource is set as the default API for the tenant, while each tenant can have either 0 or 1 default API. When a default API is designated, the resource parameter can be omitted in the auth request. Subsequent token exchanges will use that API as the audience by default, resulting in the issuance of JWTs.', // UNTRANSLATED
  api_resource_created: '{{name}} API 리소스가 성공적으로 생성되었어요.',
  api_identifier_placeholder: 'https://your-api-identifier/',
};

export default api_resources;
