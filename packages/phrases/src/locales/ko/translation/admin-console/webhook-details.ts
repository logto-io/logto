const webhook_details = {
  page_title: 'Webhook 담당자',
  back_to_webhooks: 'Webhooks로 돌아가기',
  not_in_use: '사용 중이 아님',
  success_rate: '성공율',
  requests: '24시간 동안 {{value, number}}개의 요청',
  disable_webhook: 'Webhook 비활성화',
  disable_reminder:
    '이 webhook을 재활성화 하시겠습니까? 그렇게 한다면 엔드포인트 URL에 HTTP request를 보내지 않습니다.',
  webhook_disabled: 'Webhook이 비활성화 되었습니다.',
  webhook_reactivated: 'Webhook이 다시 활성화되었습니다.',
  reactivate_webhook: 'Webhook 재활성화',
  delete_webhook: 'Webhook 삭제',
  deletion_reminder:
    '이 webhook을 삭제하고 있습니다. 삭제 후, 엔드포인트 URL에 HTTP request를 보내지 않습니다.',
  deleted: 'Webhook이 성공적으로 삭제되었습니다.',
  settings_tab: '설정',
  recent_requests_tab: '최근 요청 (24시간)',
  settings: {
    settings: '설정',
    settings_description:
      'Webhooks를 통해 이벤트가 발생할 때마다 POST request를 내 엔드포인트 URL로 보내 변경 실시간으로 확인 할 수 있습니다.',
    events: '이벤트',
    events_description: 'Logto에서 POST request를 보낼 이벤트를 선택하세요.',
    name: '이름',
    endpoint_url: '엔드포인트 URL',
    signing_key: 'Signing key',
    signing_key_tip:
      'Logto에서 제공된 시크릿 키를 사용하여 엔드포인트에 요청 헤더로 추가하여 웹훅 페이로드의 진위성 보장',
    regenerate: '재생성',
    regenerate_key_title: 'Signing key 재생성',
    regenerate_key_reminder:
      'Signing key를 수정하시겠습니까? 재생성하면 즉시 적용됩니다. 엔드포인트에서 Signing key를 동기화 하시기 바랍니다.',
    regenerated: 'Signing key가 재생성되었습니다.',
    custom_headers: '사용자 지정 헤더',
    custom_headers_tip:
      '이벤트에 대한 컨텍스트 또는 메타데이터를 제공하기 위해 webhook 페이로드에 사용자 지정 헤더를 추가할 수 있습니다.',
    key_duplicated_error: '키는 반복될 수 없습니다.',
    key_missing_error: '키는 필수 값입니다.',
    value_missing_error: '값은 필수 값입니다.',
    invalid_key_error: '키가 유효하지 않습니다',
    invalid_value_error: '값이 유효하지 않습니다',
    test: '테스트',
    test_webhook: 'Webhook 테스트',
    test_webhook_description:
      '웹훅을 구성하고 각 선택한 이벤트의 페이로드 예제로 검증하여 올바른 수신 및 처리를 확인하세요.',
    send_test_payload: '테스트 페이로드 보내기',
    test_result: {
      endpoint_url: '엔드포인트 URL: {{url}}',
      message: '메시지: {{message}}',
      response_status: '응답 상태: {{status, number}}',
      response_body: '응답 본문: {{body}}',
      request_time: '요청 시간: {{time}}',
      test_success: '엔드포인트로의 웹훅 테스트가 성공했습니다.',
    },
  },
};

export default Object.freeze(webhook_details);
