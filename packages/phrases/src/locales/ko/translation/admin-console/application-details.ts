const application_details = {
  page_title: '애플리케이션 세부 정보',
  back_to_applications: '어플리케이션으로 돌아가기',
  check_guide: '가이드 확인',
  settings: '설정',
  /** UNTRANSLATED */
  settings_description:
    'An "Application" is a registered software or service that can access user info or act for a user. Applications help recognize who’s asking for what from Logto and handle the sign-in and permission. Fill in the required fields for authentication.',
  /** UNTRANSLATED */
  integration: 'Integration',
  /** UNTRANSLATED */
  integration_description:
    "Deploy with Logto secure workers, powered by Cloudflare's edge network for top-tier performance and 0ms cold starts worldwide.",
  /** UNTRANSLATED */
  service_configuration: 'Service configuration',
  /** UNTRANSLATED */
  service_configuration_description: 'Complete the necessary configurations in your service.',
  /** UNTRANSLATED */
  session: 'Session',
  /** UNTRANSLATED */
  endpoints_and_credentials: 'Endpoints & Credentials',
  /** UNTRANSLATED */
  endpoints_and_credentials_description:
    'Use the following endpoints and credentials to set up the OIDC connection in your application.',
  /** UNTRANSLATED */
  refresh_token_settings: 'Refresh token',
  /** UNTRANSLATED */
  refresh_token_settings_description: 'Manage the refresh token rules for this application.',
  application_roles: '역할',
  machine_logs: '기계 로그',
  application_name: '어플리케이션 이름',
  application_name_placeholder: '나의 앱',
  description: '설명',
  description_placeholder: '어플리케이션 설명을 적어주세요.',
  config_endpoint: 'OpenID Provider 구성 endpoint',
  authorization_endpoint: '인증 Endpoint',
  authorization_endpoint_tip:
    '인증 및 권한 부여를 진행할 End-Point예요. OpenID Connect <a>인증</a>에서 사용되던 값이에요.',
  /** UNTRANSLATED */
  show_endpoint_details: 'Show endpoint details',
  /** UNTRANSLATED */
  hide_endpoint_details: 'Hide endpoint details',
  logto_endpoint: 'Logto endpoint',
  application_id: '앱 ID',
  application_id_tip:
    '일반적으로 Logto에서 생성되는 고유한 응용 프로그램 식별자예요. OpenID Connect에서 "<a>client_id</a>"의 약자이기도 해요.',
  application_secret: '앱 시크릿',
  redirect_uri: 'Redirect URI',
  redirect_uris: 'Redirect URIs',
  redirect_uri_placeholder: 'https://your.website.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    '사용자 로그인 이후, 리다이렉트될 URI 경로예요. 더욱 자세한 정보는 OpenID Connect <a>AuthRequest</a>를 참고해주세요.',
  post_sign_out_redirect_uri: '로그아웃 이후 Redirect URI',
  post_sign_out_redirect_uris: '로그아웃 이후 Redirect URIs',
  post_sign_out_redirect_uri_placeholder: 'https://your.website.com/home',
  post_sign_out_redirect_uri_tip:
    '로그아웃 이후, 리다이렉트될 URI 경로예요 (선택). 일부 앱에서는 실제 효과가 없을 수 있어요.',
  cors_allowed_origins: 'CORS Allow Origins',
  cors_allowed_origins_placeholder: 'https://your.website.com',
  cors_allowed_origins_tip:
    '기본으로 모든 리다이렉트의 오리진들은 허용돼요. 대체적으로 이 값을 건들 필요는 없어요. 더욱 자세한 정보는 <a>MDN doc</a>를 확인해주세요.',
  token_endpoint: '토큰 End-Point',
  user_info_endpoint: '사용자 정보 End-Point',
  enable_admin_access: '관리자 접근 활성화',
  enable_admin_access_label:
    '관리 API에 대한 접근을 활성화, 비활성화할 수 있어요. 활성화한다면, 이 어플리케이션에서 Access 토큰을 통해 관리 API를 사용할 수 있어요.',
  always_issue_refresh_token: '항상 Refresh Token을 발급하세요',
  always_issue_refresh_token_label:
    '다음 구성을 활성화하면 Logto 가 인증 요청에 `prompt=consent` 가 제시되었는지 여부와 상관없이 항상 Refresh Token 을 발급할 수 있게 됩니다. 그러나 OpenID Connect 와 호환되지 않으며 문제가 발생할 수 있으므로 필요하지 않은 경우에는 이러한 방법을 권장하지 않습니다. ',
  refresh_token_ttl: 'Refresh Token Time to Live (TTL) (일)',
  refresh_token_ttl_tip:
    'Refresh Token이 새로운 엑세스 토큰을 요청할 수 있는 기간입니다. 토큰 요청이 이루어지면 Refresh Token 의 TTL 이 이 값으로 연장됩니다.',
  rotate_refresh_token: 'Refresh Token 회전',
  rotate_refresh_token_label:
    '활성화하면, 원래의 TTL 중 70% 가 지난 후 또는 특정 조건이 충족되면 Refresh Token 요청에 대해 새로운 Refresh Token 을 발행합니다. <a>자세히 보기</a>',
  delete_description:
    '이 행동은 취소될 수 없어요. 어플리케이션을 영원히 삭제할 거에요. 삭제를 진행하기 위해 <span>{{name}}</span> 를 입력해주세요.',
  enter_your_application_name: '어플리케이션 이름을 입력해 주세요.',
  application_deleted: '{{name}} 어플리케이션이 성공적으로 삭제되었어요.',
  redirect_uri_required: '반드시 최소 하나의 Redirect URI 를 입력해야 해요.',
  /** UNTRANSLATED */
  app_domain_description_1:
    'Feel free to use your domain with {{domain}} powered by Logto, which is permanently valid.',
  /** UNTRANSLATED */
  app_domain_description_2:
    'Feel free to utilize your domain <domain>{{domain}}</domain> which is permanently valid.',
  /** UNTRANSLATED */
  custom_rules: 'Custom authentication rules',
  /** UNTRANSLATED */
  custom_rules_placeholder: '^/(admin|privacy)/.+$',
  /** UNTRANSLATED */
  custom_rules_description:
    'Set rules with regular expressions for authentication-required routes. Default: full-site protection if left blank.',
  /** UNTRANSLATED */
  authentication_routes: 'Authentication routes',
  /** UNTRANSLATED */
  custom_rules_tip:
    "Here are two case scenarios:<ol><li>To only protect routes '/admin' and '/privacy' with authentication: ^/(admin|privacy)/.*</li><li>To exclude JPG images from authentication: ^(?!.*\\.jpg$).*$</li></ol>",
  /** UNTRANSLATED */
  authentication_routes_description:
    'Redirect your authentication button using the specified routes. Note: These routes are irreplaceable.',
  /** UNTRANSLATED */
  protect_origin_server: 'Protect your origin server',
  /** UNTRANSLATED */
  protect_origin_server_description:
    'Ensure to protect your origin server from direct access. Refer to the guide for more <a>detailed instructions</a>.',
  /** UNTRANSLATED */
  session_duration: 'Session duration (days)',
  /** UNTRANSLATED */
  try_it: 'Try it',
  branding: {
    /** UNTRANSLATED */
    name: 'Branding',
    /** UNTRANSLATED */
    description: "Customize your application's display name and logo on the consent screen.",
    /** UNTRANSLATED */
    more_info: 'More info',
    /** UNTRANSLATED */
    more_info_description: 'Offer users more details about your application on the consent screen.',
    /** UNTRANSLATED */
    display_name: 'Display name',
    /** UNTRANSLATED */
    display_logo: 'Display logo',
    /** UNTRANSLATED */
    display_logo_dark: 'Display logo (dark)',
    /** UNTRANSLATED */
    terms_of_use_url: 'Application terms of use URL',
    /** UNTRANSLATED */
    privacy_policy_url: 'Application privacy policy URL',
  },
  permissions: {
    /** UNTRANSLATED */
    name: 'Permissions',
    /** UNTRANSLATED */
    description:
      'Select the permissions that the third-party application requires for user authorization to access specific data types.',
    /** UNTRANSLATED */
    user_permissions: 'Personal user data',
    /** UNTRANSLATED */
    organization_permissions: 'Organization access',
    /** UNTRANSLATED */
    table_name: 'Grant permissions',
    /** UNTRANSLATED */
    field_name: 'Permission',
    /** UNTRANSLATED */
    field_description: 'Displayed in the consent screen',
    /** UNTRANSLATED */
    delete_text: 'Remove permission',
    /** UNTRANSLATED */
    permission_delete_confirm:
      'This action will withdraw the permissions granted to the third-party app, preventing it from requesting user authorization for specific data types. Are you sure you want to continue?',
    /** UNTRANSLATED */
    permissions_assignment_description:
      'Select the permissions the third-party application requests for user authorization to access specific data types.',
    /** UNTRANSLATED */
    user_profile: 'User data',
    /** UNTRANSLATED */
    api_permissions: 'API permissions',
    /** UNTRANSLATED */
    organization: 'Organization permissions',
    /** UNTRANSLATED */
    user_permissions_assignment_form_title: 'Add the user profile permissions',
    /** UNTRANSLATED */
    organization_permissions_assignment_form_title: 'Add the organization permissions',
    /** UNTRANSLATED */
    api_resource_permissions_assignment_form_title: 'Add the API resource permissions',
    /** UNTRANSLATED */
    user_data_permission_description_tips:
      'You can modify the description of the personal user data permissions via "Sign-in Experience > Content > Manage Language"',
    /** UNTRANSLATED */
    permission_description_tips:
      'When Logto is used as an Identity Provider (IdP) for authentication in third-party apps, and users are asked for authorization, this description appears on the consent screen.',
    /** UNTRANSLATED */
    user_title: 'User',
    /** UNTRANSLATED */
    user_description:
      'Select the permissions requested by the third-party app for accessing specific user data.',
    /** UNTRANSLATED */
    grant_user_level_permissions: 'Grant permissions of user data',
    /** UNTRANSLATED */
    organization_title: 'Organization',
    /** UNTRANSLATED */
    organization_description:
      'Select the permissions requested by the third-party app for accessing specific organization data.',
    /** UNTRANSLATED */
    grant_organization_level_permissions: 'Grant permissions of organization data',
    /** UNTRANSLATED */
    add_permissions_for_organization:
      'Add the API resource permissions used in the "Organization template"',
  },
  roles: {
    name_column: '역할',
    description_column: '설명',
    assign_button: '역할 할당',
    delete_description:
      '이 행동은 이 장치 간 앱에서 이 역할을 제거합니다. 역할 자체는 여전히 존재하지만 이 장치 간 앱과 연계되지 않게 됩니다.',
    deleted: '{{name}} 가 성공적으로 삭제되었습니다.',
    assign_title: '{{name}} 에 역할 할당',
    assign_subtitle: '{{name}} 에게 하나 이상의 역할을 승인',
    assign_role_field: '역할 할당',
    role_search_placeholder: '역할 이름으로 검색',
    added_text: '{{value, number}} 추가됨',
    assigned_app_count: '{{value, number}} 개의 어플리케이션',
    confirm_assign: '역할 할당',
    role_assigned: '역할이 성공적으로 할당되었습니다.',
    search: '역할 이름, 설명 또는 ID로 검색',
    empty: '사용 가능한 역할이 없습니다.',
  },
};

export default Object.freeze(application_details);
