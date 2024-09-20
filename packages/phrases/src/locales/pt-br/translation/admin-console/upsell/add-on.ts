const add_on = {
  mfa_inline_notification:
    'MFA é um acréscimo de ${{price, number}} por mês para o {{planName}}. Primeiro mês calculado proporcionalmente com base no seu ciclo de faturamento. <a>Saiba mais</a>',
  footer: {
    api_resource:
      'Recursos adicionais custam <span>${{price, number}} por mês / cada</span>. Primeiro mês calculado proporcionalmente com base no seu ciclo de faturamento. <a>Saiba mais</a>',
    machine_to_machine_app:
      'Aplicativos de máquina para máquina adicionais custam <span>${{price, number}} por mês / cada</span>. Primeiro mês calculado proporcionalmente com base no seu ciclo de faturamento. <a>Saiba mais</a>',
    enterprise_sso:
      'SSO empresarial custa <span>${{price, number}} por mês / cada</span> como acréscimo para {{planName}}. Primeiro mês calculado proporcionalmente com base no seu ciclo de faturamento. <a>Saiba mais</a>',
    tenant_members:
      'Membros adicionais custam <span>${{price, number}} por mês / cada</span>. Primeiro mês calculado proporcionalmente com base no seu ciclo de faturamento. <a>Saiba mais</a>',
    organization:
      'Organização é um acréscimo de <span>${{price, number}} por mês</span> para {{planName}} com organizações ilimitadas. Primeiro mês calculado proporcionalmente com base no seu ciclo de faturamento. <a>Saiba mais</a>',
  },
};

export default Object.freeze(add_on);
