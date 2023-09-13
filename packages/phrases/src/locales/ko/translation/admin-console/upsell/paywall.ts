const paywall = {
  applications:
    '<planName/>의 {{count, number}}개 애플리케이션 제한에 도달했습니다. 팀의 요구를 충족하기 위해 플랜을 업그레이드하십시오. 도움이 필요하면 <a>문의</a>해 주시기 바랍니다.',
  applications_other:
    '<planName/>의 {{count, number}}개 애플리케이션 제한에 도달했습니다. 팀의 요구를 충족하기 위해 플랜을 업그레이드하십시오. 도움이 필요하면 <a>문의</a>해 주시기 바랍니다.',
  machine_to_machine_feature:
    '유료 플랜으로 업그레이드하여 기계 간 애플리케이션을 생성하고 모든 프리미엄 기능에 액세스하세요. 도움이 필요하면 <a>문의</a>해 주시기 바랍니다.',
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
    '유료 플랜으로 업그레이드하여 사용자 정의 도메인 기능과 다양한 프리미엄 혜택을 해제하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  social_connectors:
    '<planName/>의 {{count, number}}개 소셜 커넥터 한도에 도달했습니다. 팀의 요구를 충족시키기 위해 플랜을 업그레이드하고 OIDC, OAuth 2.0, SAML 프로토콜을 사용하여 고유한 커넥터를 생성할 수 있도록 하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  social_connectors_other:
    '<planName/>의 {{count, number}}개 소셜 커넥터 한도에 도달했습니다. 팀의 요구를 충족시키기 위해 플랜을 업그레이드하고 OIDC, OAuth 2.0, SAML 프로토콜을 사용하여 고유한 커넥터를 생성할 수 있도록 하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  standard_connectors_feature:
    '유료 플랜으로 업그레이드하여 OIDC, OAuth 2.0, SAML 프로토콜을 사용하여 고유한 커넥터를 생성할 수 있으며, 무제한 소셜 커넥터 및 모든 프리미엄 기능에 액세스할 수 있습니다. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
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
  scopes_per_role:
    '<planName/>의 {{count, number}}개 역할 당 권한 한도에 도달했습니다. 플랜을 업그레이드하여 추가 역할과 권한을 추가하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  scopes_per_role_other:
    '<planName/>의 {{count, number}}개 역할 당 권한 한도에 도달했습니다. 플랜을 업그레이드하여 추가 역할과 권한을 추가하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  hooks:
    '<planName/>의 {{count, number}}개 웹훅 한도에 도달했습니다. 더 많은 웹훅을 생성하려면 플랜을 업그레이드하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  hooks_other:
    '<planName/>의 {{count, number}}개 웹훅 한도에 도달했습니다. 더 많은 웹훅을 생성하려면 플랜을 업그레이드하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
};

export default Object.freeze(paywall);
