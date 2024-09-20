const add_on = {
  mfa_inline_notification:
    'MFA es un complemento de ${{price, number}} por mes para el {{planName}}. Primer mes prorrateado según tu ciclo de facturación. <a>Aprende más</a>',
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
  },
};

export default Object.freeze(add_on);
