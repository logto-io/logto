const sign_in_exp = {
  title: '로그인 경험',
  description: '로그인 화면을 브랜드에 맞게 커스터마이징 그리고 실시간으로 확인해보세요.',
  tabs: {
    branding: '브랜딩',
    sign_up_and_sign_in: 'Sign up and Sign in', // UNTRANSLATED
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
  sign_up_and_sign_in: {
    identifiers: 'Sign-up identifiers', // UNTRANSLATED
    identifiers_email: 'Email address', // UNTRANSLATED
    identifiers_sms: 'Phone number', // UNTRANSLATED
    identifiers_username: 'Username', // UNTRANSLATED
    identifiers_email_or_sms: 'Email address or phone number', // UNTRANSLATED
    identifiers_none: 'Not applicable', // UNTRANSLATED
    and: 'and', // UNTRANSLATED
    or: 'or', // UNTRANSLATED
    sign_up: {
      title: 'SIGN UP', // UNTRANSLATED
      sign_up_identifier: 'Sign-up identifier', // UNTRANSLATED
      identifier_description:
        'The sign-up identifier is required for account creation and must be included in your sign-in screen.', // UNTRANSLATED
      sign_up_authentication: 'Authentication setting for sign-up', // UNTRANSLATED
      authentication_description:
        'All selected actions will be obligatory for users to complete the flow.', // UNTRANSLATED
      set_a_password_option: 'Create your password', // UNTRANSLATED
      verify_at_sign_up_option: 'Verify at sign-up', // UNTRANSLATED
      social_only_creation_description: '(This apply to social only account creation)', // UNTRANSLATED
    },
    sign_in: {
      title: 'SIGN IN', // UNTRANSLATED
      sign_in_identifier_and_auth: 'Identifier and authentication settings for sign-in', // UNTRANSLATED
      description:
        'Users can sign in using any of the options available. Adjust the layout by drag and dropping below options.', // UNTRANSLATED
      add_sign_in_method: 'Add Sign-in Method', // UNTRANSLATED
      password_auth: 'Password', // UNTRANSLATED
      verification_code_auth: 'Verification code', // UNTRANSLATED
      auth_swap_tip: 'Swap the options below to determine which appears first in the flow.', // UNTRANSLATED
    },
    social_sign_in: {
      title: 'SOCIAL SIGN-IN', // UNTRANSLATED
      social_sign_in: 'Social sign in', // UNTRANSLATED
      description:
        'Depending on the mandatory identifier you set up, your user may be asked to provide an identifier when signing up via social connector.', // UNTRANSLATED
      add_social_connector: 'Link Social Connector', // UNTRANSLATED
      set_up_hint: {
        not_in_list: 'Not in the list?', // UNTRANSLATED
        set_up_more: 'Set up', // UNTRANSLATED
        go_to: 'other social connectors now.', // UNTRANSLATED
      },
    },
    tip: {
      set_a_password: 'A unique set of a password to your username is a must.', // UNTRANSLATED
      verify_at_sign_up:
        'We currently only support verified email. Your user base may contain a large number of poor-quality email addresses if no validation.', // UNTRANSLATED
      password_auth:
        'This is essential as you have enabled the option to set a password during the sign-up process.', // UNTRANSLATED
      verification_code_auth:
        'This is essential as you have only enabled the option to provide verification code when signing up. You’re free to uncheck the box when password set-up is allowed at the sign-up process.', // UNTRANSLATED
      delete_sign_in_method:
        'This is essential as you have selected {{identifier}} as a required identifier.', // UNTRANSLATED
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
        'The default language will be used when the detected user language isn’t covered in the current language library.', // UNTRANSLATED
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
      logto_source_values: 'Logto source values', // UNTRANSLATED
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
      enable_user_registration: 'Enable user registration', // UNTRANSLATED
      enable_user_registration_description:
        'Enable or disallow user registration. Once disabled, users can still be added in the admin console but users can no longer establish accounts through the sign-in UI.', // UNTRANSLATED
    },
  },
  setup_warning: {
    no_connector: '',
    no_connector_sms:
      'No SMS connector set-up yet. Until you finish configuring your social connector, you won’t be able to sign in.', // UNTRANSLATED
    no_connector_email:
      'No email connector set-up yet. Until you finish configuring your social connector, you won’t be able to sign in.', // UNTRANSLATED
    no_connector_social:
      'No social connector set-up yet. Until you finish configuring your social connector, you won’t be able to sign in.', // UNTRANSLATED
    no_added_social_connector:
      '보다 많은 소셜 연동들을 설정하여, 고객에게 보다 나은 경험을 제공해보세요.',
  },
  save_alert: {
    description:
      'You are implementing new sign-in and sign-up procedures. All of your users may be affected by the new set-up. Are you sure to commit to the change?', // UNTRANSLATED
    before: '이전',
    after: '이후',
    sign_up: 'Sign-up', // UNTRANSLATED
    sign_in: 'Sign-in', // UNTRANSLATED
    social: 'Social', // UNTRANSLATED
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
