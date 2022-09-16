import en from './en';

const translation = {
  input: {
    username: '사용자 이름',
    password: '비밀번호',
    email: '이메일',
    phone_number: '휴대전화번호',
    confirm_password: '비밀번호 확인',
  },
  secondary: {
    sign_in_with: '{{methods, list(type: disjunction;)}} 로그인',
    social_bind_with:
      '이미 계정이 있으신가요? {{methods, list(type: disjunction;)}}로 로그인 해보세요!',
  },
  action: {
    sign_in: '로그인',
    continue: '계속',
    create_account: '계정 생성',
    create: '생성',
    enter_passcode: '비밀번호 입력',
    confirm: '확인',
    cancel: '취소',
    bind: '{{address}}로 연동',
    back: '뒤로 가기',
    nav_back: '뒤로',
    agree: '동의',
    got_it: '알겠습니다',
    sign_in_with: '{{name}} 로그인',
  },
  description: {
    email: '이메일',
    phone_number: '휴대전화번호',
    reminder: '리마인더',
    not_found: '404 찾을 수 없음',
    agree_with_terms: '나는 내용을 읽었으며, 이에 동의합니다.',
    agree_with_terms_modal: '진행하기 위해서는, 다음을 동의해주세요 <link></link>.',
    terms_of_use: '이용약관',
    create_account: '계정 생성',
    forgot_password: '비밀번호를 잊어버리셨나요?',
    or: '또는',
    enter_passcode: '{{address}} 으로 비밀번호가 전송되었어요.',
    passcode_sent: '비밀번호가 재전송 되었습니다.',
    resend_after_seconds: '<span>{{seconds}}</span> 초 후에 재전송',
    resend_passcode: '비밀번호 재전송',
    continue_with: '계속하기',
    create_account_id_exists: '{{type}} {{value}} 계정이 이미 존재해요. 로그인하시겠어요?',
    sign_in_id_does_not_exists: '{type}} {{value}} 계정이 존재하지 않아요. 새로 만드시겠어요?',
    bind_account_title: '계정 연동',
    social_create_account: '계정이 없으신가요? 새로운 계정을 만들고 연동해보세요.',
    social_bind_account: '계정이 이미 있으신가요? 로그인하여 다른 계정과 연동해보세요.',
    social_bind_with_existing: '관련된 계정을 찾았어요. 해당 계정과 연동할 수 있습니다.',
  },
  error: {
    username_password_mismatch: '사용자 이름 또는 비밀번호가 일치하지 않아요.',
    username_required: '사용자 이름은 필수예요.',
    password_required: '비밀번호는 필수예요.',
    username_exists: '사용자 이름이 이미 존재해요.',
    username_should_not_start_with_number: '사용자 이름은 숫자로 시작하면 안되요.',
    username_valid_charset: '사용자 이름은 문자, 숫자, _(밑줄 문자) 로만 이루어져야해요.',
    invalid_email: '이메일이 유효하지 않아요.',
    invalid_phone: '휴대전화번호가 유효하지 않아요.',
    password_min_length: '비밀번호는 최소 {{min}} 자리로 이루어져야해요.',
    passwords_do_not_match: '비밀번호가 일치하지 않아요.',
    invalid_passcode: '비밀번호가 유효하지 않아요.',
    invalid_connector_auth: '인증이 유효하지 않아요.',
    invalid_connector_request: '연동 정보가 유효하지 않아요.',
    unknown: '알 수 없는 오류가 발생했어요. 잠시 후에 시도해주세요.',
    invalid_session: '세션을 찾을 수 없어요. 다시 로그인을 해주세요.',
  },
};

const koKR: typeof en = Object.freeze({
  translation,
});

export default koKR;
