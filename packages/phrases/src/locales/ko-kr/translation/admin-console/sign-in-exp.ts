const sign_in_exp = {
  title: '로그인 경험',
  description: '로그인 화면을 브랜드에 맞게 커스터마이징 그리고 실시간으로 확인해보세요.',
  tabs: {
    branding: '브랜딩',
    methods: '로그인 방법',
    others: '기타',
  },
  welcome: {
    title: '가이드를 따라, 필수 설정을 빠르게 수정해보세요.',
    get_started: '시작하기',
    apply_remind: '이 계정이 관리하는 모든 앱의 로그인 경험이 수정되는 것을 주의해주세요.',
    got_it: '네',
  },
  color: {
    title: '색상',
    primary_color: '브랜드 색상',
    dark_primary_color: '브랜드 색상 (다크 모드)',
    dark_mode: '다크 모드 활성화',
    dark_mode_description: 'Logto가 브랜드 색상에 알맞게 자동으로 다크 모드 테마를 생성해요.',
    dark_mode_reset_tip: '브랜드 색상에 알맞게 다크 모드 색상 재생성',
    reset: '재생성',
  },
  branding: {
    title: '브랜딩 영역',
    ui_style: '스타일',
    styles: {
      logo_slogan: '앱 로고 & 슬로건',
      logo: '앱 로고만',
    },
    logo_image_url: '앱 로고 이미지 URL',
    logo_image_url_placeholder: 'https://your.cdn.domain/logo.png',
    dark_logo_image_url: '앱 로고 이미지 URL (다크 모드)',
    dark_logo_image_url_placeholder: 'https://your.cdn.domain/logo-dark.png',
    slogan: '슬로건',
    slogan_placeholder: 'Unleash your creativity',
  },
  sign_in_methods: {
    title: '로그인 방법',
    primary: '메인 로그인 방법',
    enable_secondary: '백업 로그인 방법 활성화',
    enable_secondary_description:
      '백업 로그인 활성화를 통하여 메인 로그인 방법이외의 로그인 방법을 사용자에게 제공해보세요.',
    methods: '로그인 방법',
    methods_sms: 'SMS 로그인',
    methods_email: '이메일 로그인',
    methods_social: '소셜 로그인',
    methods_username: '사용자 이름&비밀번호 로그인',
    methods_primary_tag: '(메인)',
    define_social_methods: '소셜 로그인 방법 설정',
    transfer: {
      title: '소셜 연동',
      footer: {
        not_in_list: '리스트에 없나요?',
        set_up_more: '더 설정하기',
        go_to: '를 눌러 설정하러 가기',
      },
    },
  },
  others: {
    terms_of_use: {
      title: '이용 약관',
      enable: '이용 약관 활성화',
      description: '서비스 사용을 위한 이용 약관을 추가해보세요.',
      terms_of_use: '이용 약관',
      terms_of_use_placeholder: 'https://your.terms.of.use/',
      terms_of_use_tip: '이용 약관 URL',
    },
    languages: {
      title: '언어',
      enable_auto_detect: 'Enable auto-detect', // UNTRANSLATED
      description:
        "Your software detects the user's locale setting and switches to the local language. You can add new languages by translating UI from English to another language.", // UNTRANSLATED
      manage_language: 'Manage language', // UNTRANSLATED
      default_language: 'Default language', // UNTRANSLATED
      default_language_description_auto:
        'The default language will be used when a text segment is missing translation.', // UNTRANSLATED
      default_language_description_fixed:
        'When auto-detect is off, the default language is the only language your software will show. Turn on auto-detect for language extension.', // UNTRANSLATED
    },
    manage_language: {
      title: 'Manage language', // UNTRANSLATED
      subtitle:
        'Localize the product experience by adding languages and translations. Your contribution can be set as the default language.', // UNTRANSLATED
      add_language: 'Add Language', // UNTRANSLATED
      logto_provided: 'Logto provided', // UNTRANSLATED
      key: 'Key', // UNTRANSLATED
      logto_source_language: 'Logto source language', // UNTRANSLATED
      custom_values: 'Custom values', // UNTRANSLATED
      clear_all_tip: 'Clear all values', // UNTRANSLATED
      unsaved_description: 'Changes won’t be saved if you leave this page without saving.', // UNTRANSLATED
      deletion_tip: 'Delete the language', // UNTRANSLATED
      deletion_title: 'Do you want to delete the added language?', // UNTRANSLATED
      deletion_description:
        'After deletion, your users won’t be able to browse in that language again.', // UNTRANSLATED
      default_language_deletion_title: 'Default language can’t be deleted.', // UNTRANSLATED
      default_language_deletion_description:
        '{{language}} is set as your default language and can’t be deleted. ', // UNTRANSLATED
      got_it: 'Got It', // UNTRANSLATED
    },
    authentication: {
      title: 'AUTHENTICATION',
      enable_create_account: 'Enable create account',
      enable_create_account_description:
        'Enable or disable create account (sign-up). Once disabled, your customers can’t create accounts through the sign-in UI, but you can still add users in Admin Console.',
    },
  },
  setup_warning: {
    no_connector: '',
    no_connector_sms:
      'SMS 연동이 아직 설정되지 않았어요. 설정이 완료될 때 까지, 사용자는 이 로그인 방법을 사용할 수 없어요.',
    no_connector_email:
      '이메일 연동이 아직 설정되지 않았어요. 설정이 완료될 때 까지, 사용자는 이 로그인 방법을 사용할 수 없어요.',
    no_connector_social:
      '소셜 연동이 아직 설정되지 않았어요. 설정이 완료될 때 까지, 사용자는 이 로그인 방법을 사용할 수 없어요.',
    no_added_social_connector:
      '보다 많은 소셜 연동들을 설정하여, 고객에게 보다 나은 경험을 제공해보세요.',
  },
  save_alert: {
    description:
      '로그인 방법이 수정되었어요. 일부 사용자에게 영향을 미칠 수 있어요. 정말로 진행할까요?',
    before: '이전',
    after: '이후',
  },
  preview: {
    title: '로그인 화면 미리보기',
    dark: '다크',
    light: '라이트',
    native: 'Native',
    desktop_web: 'Desktop 웹',
    mobile_web: 'Mobile 웹',
  },
};

export default sign_in_exp;
