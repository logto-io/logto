const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle: '특정 이벤트에 대한 실시간 업데이트를 쉽게 수신할 수 있는 웹훅을 생성하세요.',
  create: 'Webhook 생성',
  events: {
    post_register: '새 계정 만들기',
    post_sign_in: '로그인',
    post_reset_password: '비밀번호 재설정',
  },
  table: {
    name: '이름',
    events: '이벤트',
    success_rate: '성공률 (24시간)',
    requests: '요청 (24시간)',
  },
  placeholder: {
    title: '웹훅',
    description:
      'POST 요청을 통해 엔드포인트 URL로 실시간 업데이트를 수신할 수 있는 웹훅을 생성하세요. "계정 만들기", "로그인" 및 "비밀번호 재설정"과 같은 이벤트에서 정보를 받고 즉시 조치하세요.',
    create_webhook: 'Webhook 생성',
  },
  create_form: {
    title: 'Webhook 생성',
    subtitle:
      '사용자 이벤트에 대한 세부 정보가 포함된 POST 요청을 엔드포인트 URL로 보내는 Webhook을 추가합니다.',
    events: '이벤트',
    events_description: 'Logto가 POST 요청을 보낼 트리거 이벤트를 선택합니다.',
    name: '이름',
    name_placeholder: 'Webhook 이름 입력',
    endpoint_url: 'Endpoint URL',
    endpoint_url_placeholder: 'https://your.webhook.endpoint.url',
    /** UNTRANSLATED */
    endpoint_url_tip:
      'Enter the URL of your endpoint where a webhook’s payload is sent to when the event occurs.',
    create_webhook: 'Webhook 생성',
    missing_event_error: '하나 이상의 이벤트를 선택해야 합니다.',
  },
  webhook_created: 'Webhook {{name}} 가 성공적으로 생성되었습니다.',
};

export default Object.freeze(webhooks);
