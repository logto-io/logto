const api_resources = {
  page_title: 'API 리소스',
  title: 'API 리소스',
  subtitle: '인증된 어플리케이션에서 사용될 API를 정의해주세요.',
  create: 'API 리소스 생성',
  api_name: 'API 이름',
  api_name_placeholder: 'API 이름 입력',
  api_identifier: 'API Identifier',
  api_identifier_placeholder: 'https://your-api-identifier/',
  api_identifier_tip:
    'API 리소스에 대한 고유한 식별자예요. 절대 URI여야 하며 조각 (#) 컴포넌트가 없어야 해요. OAuth 2.0의 <a>resource parameter</a>와 같아요.',
  default_api: 'Default API',
  default_api_label:
    '테넌트 당 기본 API는 0개 또는 1개만 지정 할 수 있어요. 기본 API가 지정되면 인증 요청에서 리소스 매개 변수를 생략할 수 있어요. 이후 토큰 교환이 기본적으로 대상에 해당하는 API를 사용하여 수행되어 JWT가 발급되어요. <a>자세히 알아보기</a>',
  api_resource_created: '{{name}} API 리소스가 성공적으로 생성되었어요.',
  invalid_resource_indicator_format: 'API indicator must be a valid absolute URI.',
};

export default Object.freeze(api_resources);
