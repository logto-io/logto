const upsell = {
  pro_tag: 'PRO',
  upgrade_plan: 'Atualizar plano',
  compare_plans: 'Comparar planos',
  contact_us: 'Contacte-nos',
  get_started: {
    title: 'Inicie a sua jornada de identidade perfeita com um plano gratuito!',
    description:
      'O plano gratuito é perfeito para experimentar o Logto nos seus projetos pessoais ou testes. Para aproveitar ao máximo as capacidades do Logto para a sua equipa, faça a atualização para obter acesso ilimitado às funcionalidades premium: utilização ilimitada de MAU, integração máquina a máquina, gestão RBAC, registos de auditoria a longo prazo, etc. <a>Ver todos os planos</a>',
  },
  create_tenant: {
    title: 'Selecione o seu plano de inquilino',
    description:
      'O Logto oferece opções competitivas de planos com preços inovadores e acessíveis, especialmente concebidos para empresas em crescimento. <a>Saiba mais</a>',
    base_price: 'Preço base',
    monthly_price: '{{value, number}}/mês',
    mau_unit_price: 'Preço unitário do MAU',
    view_all_features: 'Ver todas as funcionalidades',
    select_plan: 'Selecionar <name/>',
    upgrade_to: 'Atualizar para <name/>',
    free_tenants_limit: 'Até {{count, number}} inquilino gratuito',
    free_tenants_limit_other: 'Até {{count, number}} inquilinos gratuitos',
    most_popular: 'Mais popular',
    upgrade_success: 'Atualização para <name/> bem-sucedida',
  },
  paywall: {
    applications:
      'Limite de {{count, number}} aplicação do <planName/> atingido. Atualize o plano para atender às necessidades da sua equipe. Para obter qualquer ajuda, sinta-se à vontade para <a>entrar em contato conosco</a>.',
    applications_other:
      'Limite de {{count, number}} aplicações do <planName/> atingido. Atualize o plano para atender às necessidades da sua equipe. Para obter qualquer ajuda, sinta-se à vontade para <a>entrar em contato conosco</a>.',
    machine_to_machine_feature:
      'Atualize para um plano pago para criar aplicação de máquina a máquina, juntamente com acesso a todos os recursos premium. Para qualquer assistência, fique à vontade para <a>entrar em contato conosco</a>.',
    machine_to_machine:
      'Limite de {{count, number}} aplicação de máquina a máquina do <planName/> atingido. Atualize o plano para atender às necessidades da sua equipe. Para obter qualquer ajuda, sinta-se à vontade para <a>entrar em contato conosco</a>.',
    machine_to_machine_other:
      'Limite de {{count, number}} aplicações de máquina a máquina do <planName/> atingido. Atualize o plano para atender às necessidades da sua equipe. Para obter qualquer ajuda, sinta-se à vontade para <a>entrar em contato conosco</a>.',
    resources:
      'Atingiu o limite de {{count, number}} recursos de API de <planName/>. Atualize o plano para satisfazer as necessidades da sua equipa. <a>Contacte-nos</a> se precisar de assistência.',
    resources_other:
      'Atingiu o limite de {{count, number}} recursos de API de <planName/>. Atualize o plano para satisfazer as necessidades da sua equipa. <a>Contacte-nos</a> se precisar de assistência.',
    scopes_per_resource:
      'Atingiu o limite de {{count, number}} permissões por recurso de API de <planName/>. Atualize agora para expandir. <a>Contacte-nos</a> se precisar de assistência.',
    scopes_per_resource_other:
      'Atingiu o limite de {{count, number}} permissões por recurso de API de <planName/>. Atualize agora para expandir. <a>Contacte-nos</a> se precisar de assistência.',
    custom_domain:
      'Desbloqueie a funcionalidade de domínio personalizado e uma série de benefícios premium ao atualizar para um plano pago. Não hesite em <a>Contacte-nos</a> se precisar de ajuda.',
    social_connectors:
      'Atingiu o limite de {{count, number}} conectores sociais de <planName/>. Atualize o plano para obter conectores sociais adicionais e a capacidade de criar os seus próprios conectores usando os protocolos OIDC, OAuth 2.0 e SAML. Não hesite em <a>Contacte-nos</a> se precisar de ajuda.',
    social_connectors_other:
      'Atingiu o limite de {{count, number}} conectores sociais de <planName/>. Atualize o plano para obter conectores sociais adicionais e a capacidade de criar os seus próprios conectores usando os protocolos OIDC, OAuth 2.0 e SAML. Não hesite em <a>Contacte-nos</a> se precisar de ajuda.',
    standard_connectors_feature:
      'Atualize para um plano pago para criar os seus próprios conectores usando os protocolos OIDC, OAuth 2.0 e SAML, além de obter conectores sociais ilimitados e todas as funcionalidades premium. Não hesite em <a>Contacte-nos</a> se precisar de ajuda.',
    standard_connectors:
      'Atingiu o limite de {{count, number}} conectores sociais de <planName/>. Atualize o plano para obter conectores sociais adicionais e a capacidade de criar os seus próprios conectores usando os protocolos OIDC, OAuth 2.0 e SAML. Não hesite em <a>Contacte-nos</a> se precisar de ajuda.',
    standard_connectors_other:
      'Atingiu o limite de {{count, number}} conectores sociais de <planName/>. Atualize o plano para obter conectores sociais adicionais e a capacidade de criar os seus próprios conectores usando os protocolos OIDC, OAuth 2.0 e SAML. Não hesite em <a>Contacte-nos</a> se precisar de ajuda.',
    standard_connectors_pro:
      'Atingiu o limite de {{count, number}} conectores padrão de <planName/>. Atualize para o plano Empresarial para obter conectores sociais adicionais e a capacidade de criar os seus próprios conectores usando os protocolos OIDC, OAuth 2.0 e SAML. Não hesite em <a>Contacte-nos</a> se precisar de ajuda.',
    standard_connectors_pro_other:
      'Atingiu o limite de {{count, number}} conectores padrão de <planName/>. Atualize para o plano Empresarial para obter conectores sociais adicionais e a capacidade de criar os seus próprios conectores usando os protocolos OIDC, OAuth 2.0 e SAML. Não hesite em <a>Contacte-nos</a> se precisar de ajuda.',
    roles:
      'Atingiu o limite de {{count, number}} funções de <planName/>. Atualize o plano para adicionar funções e permissões adicionais. Não hesite em <a>Contacte-nos</a> se precisar de ajuda.',
    roles_other:
      'Atingiu o limite de {{count, number}} funções de <planName/>. Atualize o plano para adicionar funções e permissões adicionais. Não hesite em <a>Contacte-nos</a> se precisar de ajuda.',
    scopes_per_role:
      'Atingiu o limite de {{count, number}} permissões por função de <planName/>. Atualize o plano para adicionar funções e permissões adicionais. Não hesite em <a>Contacte-nos</a> se precisar de ajuda.',
    scopes_per_role_other:
      'Atingiu o limite de {{count, number}} permissões por função de <planName/>. Atualize o plano para adicionar funções e permissões adicionais. Não hesite em <a>Contacte-nos</a> se precisar de ajuda.',
    hooks:
      'Atingiu o limite de {{count, number}} webhooks de <planName/>. Atualize o plano para criar mais webhooks. Não hesite em <a>Contacte-nos</a> se precisar de ajuda.',
    hooks_other:
      'Atingiu o limite de {{count, number}} webhooks de <planName/>. Atualize o plano para criar mais webhooks. Não hesite em <a>Contacte-nos</a> se precisar de ajuda.',
  },
  mau_exceeded_modal: {
    title: 'MAU excedeu o limite. Atualize o seu plano.',
    notification:
      'O seu MAU atual excedeu o limite de <planName/>. Por favor, atualize para o plano premium a tempo para evitar a suspensão do serviço do Logto.',
    update_plan: 'Atualizar plano',
  },
  payment_overdue_modal: {
    title: 'Pagamento da fatura em atraso',
    notification:
      'Oops! O pagamento da fatura do inquilino <span>{{name}}</span> falhou. Por favor, pague a fatura prontamente para evitar a suspensão do serviço Logto.',
    unpaid_bills: 'Faturas não pagas',
    update_payment: 'Atualizar pagamento',
  },
};

export default upsell;
