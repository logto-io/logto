const connector_details = {
  back_to_connectors: '연동으로 돌아가기',
  check_readme: 'README 확인',
  settings: 'General settings', // UNTRANSLATED
  settings_description:
    'Logto에서 연동은 중요한 역할을 해요. 연동 시스템을 통하여, 사용자들에게 비밀번호 없이 회원 가입을 하고 로그인을 할 수 있게 하거나, 소셜 계정을 통하여 로그인을 할 수 있게 도와줘요.',
  parameter_configuration: 'Parameter configuration', // UNTRANSLATED
  test_connection: 'Test connection', // UNTRANSLATED
  save_error_empty_config: '설정을 입력해 주세요.',
  send: '보내기',
  send_error_invalid_format: '유효하지 않은 입력',
  edit_config_label: '여기에 JSON을 입력해 주세요.',
  test_email_sender: '이메일 연동 테스트',
  test_sms_sender: 'SMS 연동 테스트',
  test_email_placeholder: 'john.doe@example.com',
  test_sms_placeholder: '+82 10-1234-5678',
  test_message_sent: '테스트 메세지 전송 완료',
  test_sender_description:
    'Logto는 "Generic" 템플릿을 사용하여 테스트합니다. 커넥터가 올바르게 구성되면 메시지를 받게 됩니다.',
  options_change_email: '이메일 연동 수정',
  options_change_sms: 'SMS 연동 수정',
  connector_deleted: '연동이 성공적으로 제거되었어요.',
  type_email: '이메일 연동',
  type_sms: 'SMS 연동',
  type_social: '소셜 연동',
  in_used_social_deletion_description:
    'This connector is in-use in your sign in experience. By deleting, <name/> sign in experience will be deleted in sign in experience settings. You will need to reconfigure it if you decide to add it back.', // UNTRANSLATED
  in_used_passwordless_deletion_description:
    'This {{name}} is in-use in your sign-in experience. By deleting, your sign-in experience will not work properly until you resolve the conflict. You will need to reconfigure it if you decide to add it back.', // UNTRANSLATED
  deletion_description:
    'You are removing this connector. It cannot be undone, and you will need to reconfigure it if you decide to add it back.', // UNTRANSLATED
};

export default connector_details;
