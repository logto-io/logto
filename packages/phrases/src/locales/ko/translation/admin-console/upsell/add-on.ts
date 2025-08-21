const add_on = {
  mfa_inline_notification:
    'MFA 는 {{planName}}에 대한 월 ${{price, number}} 추가 기능입니다. 첫 번째 달은 청구 주기에 따라 비례 배분됩니다. <a>자세히 알아보기</a>',
  security_features_inline_notification:
    'CAPTCHA 활성화, 사용자 정의 잠금 경험 및 기타 고급 보안 기능을 사용할 수 있습니다. 이 모든 것이 월 ${{price, number}}에 추가 번들에 포함되어 있습니다.',
  footer: {
    api_resource:
      '추가 리소스는 월 ${{price, number}} / 개당 비용이 청구됩니다. 첫 번째 달은 청구 주기에 따라 비례 배분됩니다. <a>자세히 알아보기</a>',
    machine_to_machine_app:
      '추가 기계-대-기계 애플리케이션은 월 ${{price, number}} / 개당 비용이 청구됩니다. 첫 번째 달은 청구 주기에 따라 비례 배분됩니다. <a>자세히 알아보기</a>',
    enterprise_sso:
      'Enterprise SSO 는 {{planName}}에 대한 월 ${{price, number}} 추가 기능입니다. 첫 번째 달은 청구 주기에 따라 비례 배분됩니다. <a>자세히 알아보기</a>',
    tenant_members:
      '추가 멤버는 월 ${{price, number}} / 개당 비용이 청구됩니다. 첫 번째 달은 청구 주기에 따라 비례 배분됩니다. <a>자세히 알아보기</a>',
    organization:
      'Organization 는 무제한 조직과 함께 {{planName}}에 대한 월 ${{price, number}} 추가 기능입니다. 첫 번째 달은 청구 주기에 따라 비례 배분됩니다. <a>자세히 알아보기</a>',
    /** UNTRANSLATED */
    saml_apps:
      'Additional SAML apps cost <span>${{price, number}} per mo / ea</span>. First month prorated based on your billing cycle. <a>Learn more</a>',
    /** UNTRANSLATED */
    third_party_apps:
      'Additional third-party apps cost <span>${{price, number}} per mo / ea</span>. First month prorated based on your billing cycle. <a>Learn more</a>',
  },
};

export default Object.freeze(add_on);
