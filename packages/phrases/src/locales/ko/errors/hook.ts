const hook = {
  missing_events: '최소한 하나의 이벤트를 제공해야 합니다.',
  send_test_payload_failed: '테스트 페이로드 보내기 실패: {{message}}',
  endpoint_responded_with_error: '엔드포인트가 오류로 응답했습니다.',
  disabled: '후크가 비활성화되어 이벤트를 다시 전송할 수 없습니다.',
  log_not_permanently_failed: '영구적으로 실패한 웹훅 전송만 다시 전송할 수 있습니다.',
  invalid_log_payload: '웹훅 로그 항목에 다시 전송할 유효한 요청 페이로드가 없습니다.',
  redelivery_in_progress: '이 웹훅 이벤트에 대한 전송 또는 재전송이 이미 진행 중입니다.',
};

export default Object.freeze(hook);
