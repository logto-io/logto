const add_on = {
  mfa_inline_notification:
    'MFA es un complemento de ${{price, number}} por mes para el {{planName}}. Primer mes prorrateado según tu ciclo de facturación. <a>Aprende más</a>',
  security_features_inline_notification:
    'Habilita CAPTCHA, experiencia de bloqueo personalizada y otras características de seguridad avanzadas, todas incluidas en un paquete complementario por solo ${{price, number}}/mes.',
  footer: {
    api_resource:
      'Los recursos adicionales cuestan <span>${{price, number}} por mes / cada uno</span>. Primer mes prorrateado según tu ciclo de facturación. <a>Aprende más</a>',
    machine_to_machine_app:
      'Las aplicaciones de máquina a máquina adicionales cuestan <span>${{price, number}} por mes / cada una</span>. Primer mes prorrateado según tu ciclo de facturación. <a>Aprende más</a>',
    enterprise_sso:
      'SSO empresarial es un complemento de <span>${{price, number}} por mes / cada uno</span> para {{planName}}. Primer mes prorrateado según tu ciclo de facturación. <a>Aprende más</a>',
    tenant_members:
      'Miembros adicionales cuestan <span>${{price, number}} por mes / cada uno</span>. Primer mes prorrateado según tu ciclo de facturación. <a>Aprende más</a>',
    organization:
      'La organización es un complemento de <span>${{price, number}} por mes</span> para {{planName}} con organizaciones ilimitadas. Primer mes prorrateado según tu ciclo de facturación. <a>Aprende más</a>',
    saml_apps:
      'Las aplicaciones adicionales de SAML cuestan <span>${{price, number}} por mes / cada una</span>. El primer mes se prorratea según tu ciclo de facturación. <a>Aprende más</a>',
    third_party_apps:
      'Las aplicaciones de terceros adicionales cuestan <span>${{price, number}} por mes / cada una</span>. El primer mes se prorratea según tu ciclo de facturación. <a>Aprende más</a>',
    roles:
      'El control de acceso basado en roles es un complemento de <span>${{price, number}} por mes</span> para el plan Pro con roles ilimitados. El primer mes se prorratea según tu ciclo de facturación. <a>Aprende más</a>',
  },
};

export default Object.freeze(add_on);
