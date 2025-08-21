const add_on = {
  mfa_inline_notification:
    'MFA é um suplemento de ${{price, number}} por mês para o {{planName}}. Primeiro mês é prorateado com base no seu ciclo de faturação. <a>Saber mais</a>',
  security_features_inline_notification:
    'Ative CAPTCHA, experiência personalizada de bloqueio e outros recursos avançados de segurança — tudo incluído em um pacote de complementos por apenas ${{price, number}}/mês.',
  footer: {
    api_resource:
      'Os recursos adicionais custam <span>${{price, number}} por mês / cada</span>. Primeiro mês é prorateado com base no seu ciclo de faturação. <a>Saber mais</a>',
    machine_to_machine_app:
      'Aplicações máquina-a-máquina adicionais custam <span>${{price, number}} por mês / cada</span>. Primeiro mês é prorateado com base no seu ciclo de faturação. <a>Saber mais</a>',
    enterprise_sso:
      'SSO empresarial custa <span>${{price, number}} por mês / cada</span> suplemento para {{planName}}. Primeiro mês é prorateado com base no seu ciclo de faturação. <a>Saber mais</a>',
    tenant_members:
      'Membros adicionais custam <span>${{price, number}} por mês / cada</span>. Primeiro mês é prorateado com base no seu ciclo de faturação. <a>Saber mais</a>',
    organization:
      'Organização é um suplemento de <span>${{price, number}} por mês</span> para {{planName}} com organizações ilimitadas. Primeiro mês é prorateado com base no seu ciclo de faturação. <a>Saber mais</a>',
    /** UNTRANSLATED */
    saml_apps:
      'Additional SAML apps cost <span>${{price, number}} per mo / ea</span>. First month prorated based on your billing cycle. <a>Learn more</a>',
    /** UNTRANSLATED */
    third_party_apps:
      'Additional third-party apps cost <span>${{price, number}} per mo / ea</span>. First month prorated based on your billing cycle. <a>Learn more</a>',
  },
};

export default Object.freeze(add_on);
