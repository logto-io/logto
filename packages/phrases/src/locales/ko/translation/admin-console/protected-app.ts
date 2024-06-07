const protected_app = {
  name: '보호된 앱',
  title: '보호된 앱 생성: 간편한 인증 및 뛰어난 속도로 추가하세요',
  description:
    '보호된 앱은 사용자 세션을 안전하게 유지하고 앱 요청을 프록시로 전달합니다. Cloudflare Workers를 통해 제공되며 전 세계에서 최고 수준의 성능과 0ms의 콜드 스타트를 경험하세요. <a>더 알아보기</a>',
  fast_create: '빠르게 생성',
  modal_title: '보호된 앱 생성',
  modal_subtitle:
    '클릭 몇 번으로 보안 및 빠른 보호 기능을 활성화하세요. 기존 웹 앱에 쉽게 인증을 추가하세요.',
  form: {
    url_field_label: '원본 URL',
    url_field_placeholder: 'https://domain.com/',
    url_field_description: '인증 보호가 필요한 앱의 주소를 제공하세요.',
    url_field_modification_notice:
      '원본 URL에 대한 수정 사항은 전 세계 네트워크 위치에서 효과가 발생하기까지 1-2분이 소요될 수 있습니다.',
    url_field_tooltip:
      "애플리케이션의 주소를 제공하세요. '/pathname'을 제외한 주소를 제공하세요. 생성 후에는 라우트 인증 규칙을 사용자화할 수 있습니다.\n\n참고: 원본 URL 자체에는 인증이 필요하지 않으며, 보호는 지정된 앱 도메인을 통해 액세스에 배타적으로 적용됩니다.",
    domain_field_label: '앱 도메인',
    domain_field_placeholder: 'your-domain',
    domain_field_description:
      '이 URL은 원본 URL에 대한 인증 보호 프록시로 작동합니다. 생성 후에 사용자 정의 도메인을 적용할 수 있습니다.',
    domain_field_description_short: '이 URL은 원본 URL에 대한 인증 보호 프록시로 작동합니다.',
    domain_field_tooltip:
      "Logto로 보호된 앱은 기본적으로 'your-domain.{{domain}}'에서 호스팅됩니다. 생성 후에 사용자 정의 도메인을 적용할 수 있습니다.",
    create_application: '애플리케이션 생성',
    create_protected_app: '빠르게 생성',
    errors: {
      domain_required: '도메인을 입력하세요.',
      domain_in_use: '이 서브도메인 이름은 이미 사용 중입니다.',
      invalid_domain_format: "잘못된 서브도메인 형식: 소문자, 숫자, 하이픈 '-'만 사용하세요.",
      url_required: '원본 URL을 입력하세요.',
      invalid_url:
        "잘못된 원본 URL 형식: http:// 또는 https://를 사용하세요. 참고: '/pathname'은 현재 지원되지 않습니다.",
      localhost:
        '로컬 서버를 먼저 인터넷에 노출시켜야 합니다. <a>로컬 개발</a>에 대해 더 알아보기.',
    },
  },
  success_message: '🎉 앱 인증이 성공적으로 활성화되었습니다! 새로운 웹 사이트 경험을 탐색하세요.',
};

export default Object.freeze(protected_app);
