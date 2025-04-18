const add_on = {
  mfa_inline_notification:
    'MFA é um suplemento de ${{price, number}} por mês para o {{planName}}. Primeiro mês é prorateado com base no seu ciclo de faturação. <a>Saber mais</a>',
  /** UNTRANSLATED */
  security_features_inline_notification:
    'Enable CAPTCHA, custom lockout experience, and other advanced security features—all included in an add-on bundle for just ${{price, number}}/month.',
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
  },
};

export default Object.freeze(add_on);
