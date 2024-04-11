const paywall = {
  applications:
    '<planName/>의 {{count, number}}개 애플리케이션 제한에 도달했습니다. 팀의 요구를 충족하기 위해 플랜을 업그레이드하십시오. 도움이 필요하면 <a>문의</a>해 주시기 바랍니다.',
  applications_other:
    '<planName/>의 {{count, number}}개 애플리케이션 제한에 도달했습니다. 팀의 요구를 충족하기 위해 플랜을 업그레이드하십시오. 도움이 필요하면 <a>문의</a>해 주시기 바랍니다.',
  machine_to_machine_feature:
    'Switch to the <strong>Pro</strong> plan to gain extra machine-to-machine applications and enjoy all premium features. <a>Contact us</a> if you have questions.',
  machine_to_machine:
    '<planName/>의 {{count, number}}개 기계 간 애플리케이션 제한에 도달했습니다. 팀의 요구를 충족하기 위해 플랜을 업그레이드하십시오. 도움이 필요하면 <a>문의</a>해 주시기 바랍니다.',
  machine_to_machine_other:
    '<planName/>의 {{count, number}}개 기계 간 애플리케이션 제한에 도달했습니다. 팀의 요구를 충족하기 위해 플랜을 업그레이드하십시오. 도움이 필요하면 <a>문의</a>해 주시기 바랍니다.',
  resources:
    '<planName/>의 {{count, number}}개 API 리소스 한도에 도달했습니다. 팀의 요구를 충족시키기 위해 플랜을 업그레이드하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  resources_other:
    '<planName/>의 {{count, number}}개 API 리소스 한도에 도달했습니다. 팀의 요구를 충족시키기 위해 플랜을 업그레이드하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  scopes_per_resource:
    '<planName/>의 {{count, number}}개 API 리소스 당 권한 한도에 도달했습니다. 확장을 위해 지금 업그레이드하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  scopes_per_resource_other:
    '<planName/>의 {{count, number}}개 API 리소스 당 권한 한도에 도달했습니다. 확장을 위해 지금 업그레이드하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  custom_domain:
    '사용자 정의 도메인 기능을 잠금 해제하려면 <strong>Hobby</strong> 또는 <strong>Pro</strong> 플랜으로 업그레이드하세요. 도움이 필요하면 <a>문의</a>해 주시기 바랍니다.',
  social_connectors:
    '<planName/>의 {{count, number}}개 소셜 커넥터 한도에 도달했습니다. 팀의 요구를 충족시키기 위해 플랜을 업그레이드하고 OIDC, OAuth 2.0, SAML 프로토콜을 사용하여 고유한 커넥터를 생성할 수 있도록 하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  social_connectors_other:
    '<planName/>의 {{count, number}}개 소셜 커넥터 한도에 도달했습니다. 팀의 요구를 충족시키기 위해 플랜을 업그레이드하고 OIDC, OAuth 2.0, SAML 프로토콜을 사용하여 고유한 커넥터를 생성할 수 있도록 하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  standard_connectors_feature:
    '<strong>Hobby</strong> 또는 <strong>Pro</strong> 플랜으로 업그레이드하여 OIDC, OAuth 2.0, SAML 프로토콜을 사용하여 고유한 커넥터를 생성하고 모든 프리미엄 기능과 무제한 소셜 커넥터를 사용하십시오. 도움이 필요하면 <a>문의</a>해 주시기 바랍니다.',
  standard_connectors:
    '<planName/>의 {{count, number}}개 소셜 커넥터 한도에 도달했습니다. 팀의 요구를 충족시키기 위해 플랜을 업그레이드하고 OIDC, OAuth 2.0, SAML 프로토콜을 사용하여 고유한 커넥터를 생성할 수 있도록 하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  standard_connectors_other:
    '<planName/>의 {{count, number}}개 소셜 커넥터 한도에 도달했습니다. 팀의 요구를 충족시키기 위해 플랜을 업그레이드하고 OIDC, OAuth 2.0, SAML 프로토콜을 사용하여 고유한 커넥터를 생성할 수 있도록 하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  standard_connectors_pro:
    '<planName/>의 {{count, number}}개 표준 커넥터 한도에 도달했습니다. 팀의 요구를 충족시키기 위해 엔터프라이즈 플랜으로 업그레이드하고 OIDC, OAuth 2.0, SAML 프로토콜을 사용하여 고유한 커넥터를 생성할 수 있도록 하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  standard_connectors_pro_other:
    '<planName/>의 {{count, number}}개 표준 커넥터 한도에 도달했습니다. 팀의 요구를 충족시키기 위해 엔터프라이즈 플랜으로 업그레이드하고 OIDC, OAuth 2.0, SAML 프로토콜을 사용하여 고유한 커넥터를 생성할 수 있도록 하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  roles:
    '<planName/>의 {{count, number}}개 역할 한도에 도달했습니다. 플랜을 업그레이드하여 추가 역할과 권한을 추가하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  roles_other:
    '<planName/>의 {{count, number}}개 역할 한도에 도달했습니다. 플랜을 업그레이드하여 추가 역할과 권한을 추가하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  machine_to_machine_roles:
    '{{count, number}} machine-to-machine role of <planName/> limit reached. Upgrade plan to add additional roles and permissions. Feel free to <a>contact us</a> if you need any assistance.',
  machine_to_machine_roles_other:
    '{{count, number}} machine-to-machine roles of <planName/> limit reached. Upgrade plan to add additional roles and permissions. Feel free to <a>contact us</a> if you need any assistance.',
  scopes_per_role:
    '<planName/>의 {{count, number}}개 역할 당 권한 한도에 도달했습니다. 플랜을 업그레이드하여 추가 역할과 권한을 추가하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  scopes_per_role_other:
    '<planName/>의 {{count, number}}개 역할 당 권한 한도에 도달했습니다. 플랜을 업그레이드하여 추가 역할과 권한을 추가하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  hooks:
    '<planName/>의 {{count, number}}개 웹훅 한도에 도달했습니다. 더 많은 웹훅을 생성하려면 플랜을 업그레이드하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  hooks_other:
    '<planName/>의 {{count, number}}개 웹훅 한도에 도달했습니다. 더 많은 웹훅을 생성하려면 플랜을 업그레이드하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  mfa: '보안을 확인하기 위해 MFA를 잠금 해제하여 유료 플랜으로 업그레이드하세요. 궁금한 점이 있으면 <a>문의하세요</a>.',
  organizations:
    'Unlock organizations by upgrading to a paid plan. Don’t hesitate to <a>contact us</a> if you need any assistance.',
  /** UNTRANSLATED */
  third_party_apps:
    'Unlock Logto as IdP for third-party apps by upgrading to a paid plan. For any assistance, feel free to <a>contact us</a>.',
  /** UNTRANSLATED */
  sso_connectors:
    'Unlock enterprise sso by upgrading to a paid plan. For any assistance, feel free to <a>contact us</a>.',
  /** UNTRANSLATED */
  tenant_members:
    'Unlock collaboration feature by upgrading to a paid plan. For any assistance, feel free to <a>contact us</a>.',
  /** UNTRANSLATED */
  tenant_members_dev_plan:
    "You've reached your {{limit}}-member limit. Release a member or revoke a pending invitation to add someone new. Need more seats? Feel free to contact us.",
};

export default Object.freeze(paywall);
