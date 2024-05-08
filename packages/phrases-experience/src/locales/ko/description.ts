const description = {
  email: '이메일',
  phone_number: '휴대전화번호',
  username: '사용자 이름',
  reminder: '리마인더',
  not_found: '404 찾을 수 없음',
  agree_with_terms: '나는 내용을 읽었으며, 이에 동의합니다.',
  agree_with_terms_modal: '진행하기 위해서는, 다음을 동의해주세요 <link></link>.',
  terms_of_use: '이용약관',
  sign_in: '로그인',
  privacy_policy: '개인정보처리방침',
  create_account: '계정 생성',
  or: '또는',
  and: '그리고',
  enter_passcode: '{{address}} {{target}} 으로 비밀번호가 전송되었어요.',
  passcode_sent: '비밀번호가 재전송되었어요.',
  resend_after_seconds: '<span>{{seconds}}</span> 초 후에 재전송',
  resend_passcode: '비밀번호 재전송',
  create_account_id_exists:
    '{{type}} {{value}} 계정은 다른 계정과 연결되어 있습니다. 다른 {{type}}을(를) 시도해주세요.',
  link_account_id_exists: '{{type}} {{value}}와/과 연동된 계정이 이미 존재해요. 연동할까요?',
  sign_in_id_does_not_exist: '{type}} {{value}} 계정이 존재하지 않아요. 새로 만드시겠어요?',
  sign_in_id_does_not_exist_alert: '{{type}} {{value}} 계정이 존재하지 않아요.',
  create_account_id_exists_alert: '{{type}} {{value}} 이미 존재해요.',
  social_identity_exist:
    '{{type}} {{value}}이/가 다른 계정과 연동되어 있어요. 다른 {{type}}을/를 시도해 보세요.',
  bind_account_title: '계정 만들거나 연동하기',
  social_create_account: '새로운 계정을 만들 수 있습니다.',
  social_link_email: '다른 이메일을 연동할 수 있어요',
  social_link_phone: '다른 휴대전화를 연동할 수 있어요',
  social_link_email_or_phone: '다른 이메일이나 휴대전화를 연동할 수 있어요',
  social_bind_with_existing: '등록된 관련 {{method}}이 있습니다. 직접 연결할 수 있습니다.',
  reset_password: '비밀번호를 잊으셨나요',
  reset_password_description:
    '귀하의 계정과 연결된 {{types, list(type: disjunction;)}}를 입력하면 비밀번호 재설정을 위한 인증 코드를 보내드립니다.',
  new_password: '새 비밀번호',
  set_password: '비밀번호 설정',
  password_changed: '비밀번호 변경됨',
  no_account: '계정이 없나요?',
  have_account: '이미 계정이 있나요?',
  enter_password: '비밀번호 입력',
  enter_password_for: '{{method}} {{value}} 비밀번호 로그인',
  enter_username: '사용자 이름 설정하기',
  enter_username_description:
    '사용자 이름은 로그인을 할 때 사용되요. 사용자 이름에는 문자, 숫자 및 밑줄만 포함되어야 해요.',
  link_email: '이메일 연동',
  link_phone: '휴대전화번호 연동',
  link_email_or_phone: '이메일 또는 휴대전화번호 연동',
  link_email_description: '더 나은 보안을 위해 이메일을 연동해 주세요.',
  link_phone_description: '더 나은 보안을 위해 휴대전화번호를 연동해 주세요.',
  link_email_or_phone_description: '더 나은 보안을 위해 이메일 또는 휴대전화번호를 연동해 주세요.',
  continue_with_more_information: '더 나은 보안을 위해 아래 자세한 내용을 따라 주세요.',
  create_your_account: '계정 생성하기',
  sign_in_to_your_account: '계정에 로그인하세요',
  no_region_code_found: '지역 코드를 찾을 수 없습니다.',
  verify_email: '이메일 인증',
  verify_phone: '휴대전화번호 인증',
  password_requirements: '비밀번호는 {{items, list}} 로 이루어져야 합니다.',
  password_requirement: {
    length_one: '최소 {{count}} 자 이상이어야 함',
    length_other: '최소 {{count}} 문자 이상이어야 함',
    character_types_one: '최소 {{count}} 개의 대문자, 소문자, 숫자, 특수 기호를 포함해야 함',
    character_types_other: '최소 {{count}} 개의 대문자, 소문자, 숫자, 특수 기호를 포함해야 함',
  },
  use: '사용',
  single_sign_on_email_form: '기업 이메일 주소를 입력하세요',
  single_sign_on_connectors_list:
    '귀하의 기업은 {{email}} 이메일 계정에 대해 Single Sign-On을 활성화했습니다. 다음 SSO 제공업체를 사용하여 로그인을 계속할 수 있습니다.',
  single_sign_on_enabled: '이 계정에는 Single Sign-On이 활성화되어 있습니다.',
  /** UNTRANSLATED */
  authorize_title: 'Authorize {{name}}',
  /** UNTRANSLATED */
  request_permission: '{{name}} is requesting access to:',
  /** UNTRANSLATED */
  grant_organization_access: 'Grant the organization access:',
  /** UNTRANSLATED */
  authorize_personal_data_usage: 'Authorize the use of your personal data:',
  /** UNTRANSLATED */
  authorize_organization_access: 'Authorize access to the specific organization:',
  /** UNTRANSLATED */
  user_scopes: 'Personal user data',
  /** UNTRANSLATED */
  organization_scopes: 'Organization access',
  /** UNTRANSLATED */
  authorize_agreement: `By authorizing the access, you agree to the {{name}}'s <link></link>.`,
  /** UNTRANSLATED */
  authorize_agreement_with_redirect: `By authorizing the access, you agree to the {{name}}'s <link></link>, and will be redirected to {{uri}}.`,
  /** UNTRANSLATED */
  not_you: 'Not you?',
  /** UNTRANSLATED */
  user_id: 'User ID: {{id}}',
  /** UNTRANSLATED */
  redirect_to: 'You will be redirected to {{name}}.',
};

export default Object.freeze(description);
