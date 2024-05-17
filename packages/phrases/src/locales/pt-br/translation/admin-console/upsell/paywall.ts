const paywall = {
  applications:
    'Limite de {{count, number}} aplicação do <planName/> atingido. Atualize o plano para atender às necessidades da sua equipe. Para obter qualquer ajuda, sinta-se à vontade para <a>entrar em contato conosco</a>.',
  applications_other:
    'Limite de {{count, number}} aplicações do <planName/> atingido. Atualize o plano para atender às necessidades da sua equipe. Para obter qualquer ajuda, sinta-se à vontade para <a>entrar em contato conosco</a>.',
  machine_to_machine_feature:
    'Altere para o plano <strong>Pro</strong> para ganhar aplicativos adicionais de máquina para máquina e aproveitar todos os recursos premium. <a>Entre em contato conosco</a> se tiver dúvidas.',
  machine_to_machine:
    'Limite de {{count, number}} aplicação de máquina para máquina do <planName/> atingido. Atualize o plano para atender às necessidades da sua equipe. Para obter qualquer ajuda, sinta-se à vontade para <a>entrar em contato conosco</a>.',
  machine_to_machine_other:
    'Limite de {{count, number}} aplicações de máquina para máquina do <planName/> atingido. Atualize o plano para atender às necessidades da sua equipe. Para obter qualquer ajuda, sinta-se à vontade para <a>entrar em contato conosco</a>.',
  resources:
    'Atingiu o limite de {{count, number}} recursos de API de <planName/>. Atualize o plano para satisfazer as necessidades da sua equipe. <a>Entre em contato conosco</a> se precisar de assistência.',
  resources_other:
    'Atingiu o limite de {{count, number}} recursos de API de <planName/>. Atualize o plano para satisfazer as necessidades da sua equipe. <a>Entre em contato conosco</a> se precisar de assistência.',
  scopes_per_resource:
    'Atingiu o limite de {{count, number}} permissões por recurso de API de <planName/>. Atualize agora para expandir. <a>Entre em contato conosco</a> se precisar de assistência.',
  scopes_per_resource_other:
    'Atingiu o limite de {{count, number}} permissões por recurso de API de <planName/>. Atualize agora para expandir. <a>Entre em contato conosco</a> se precisar de assistência.',
  custom_domain:
    'Desbloqueie a funcionalidade de domínio personalizado ao atualizar para o plano <strong>Hobby</strong> ou <strong>Pro</strong>. Não hesite em <a>entrar em contato conosco</a> se precisar de alguma ajuda.',
  social_connectors:
    'Atingiu o limite de {{count, number}} conectores sociais de <planName/>. Atualize o plano para obter conectores sociais adicionais e a capacidade de criar os seus próprios conectores usando os protocolos OIDC, OAuth 2.0 e SAML. Não hesite em <a>Entre em contato conosco</a> se precisar de ajuda.',
  social_connectors_other:
    'Atingiu o limite de {{count, number}} conectores sociais de <planName/>. Atualize o plano para obter conectores sociais adicionais e a capacidade de criar os seus próprios conectores usando os protocolos OIDC, OAuth 2.0 e SAML. Não hesite em <a>Entre em contato conosco</a> se precisar de ajuda.',
  standard_connectors_feature:
    'Atualize para o plano <strong>Hobby</strong> ou <strong>Pro</strong> para criar seus próprios conectores usando os protocolos OIDC, OAuth 2.0 e SAML, além de conectores sociais ilimitados e todos os recursos premium. Sinta-se à vontade para <a>entrar em contato conosco</a> se precisar de qualquer ajuda.',
  standard_connectors:
    'Atingiu o limite de {{count, number}} conectores sociais de <planName/>. Atualize o plano para obter conectores sociais adicionais e a capacidade de criar os seus próprios conectores usando os protocolos OIDC, OAuth 2.0 e SAML. Não hesite em <a>Entre em contato conosco</a> se precisar de ajuda.',
  standard_connectors_other:
    'Atingiu o limite de {{count, number}} conectores sociais de <planName/>. Atualize o plano para obter conectores sociais adicionais e a capacidade de criar os seus próprios conectores usando os protocolos OIDC, OAuth 2.0 e SAML. Não hesite em <a>Entre em contato conosco</a> se precisar de ajuda.',
  standard_connectors_pro:
    'Atingiu o limite de {{count, number}} conectores padrão de <planName/>. Atualize para o plano Empresarial para obter conectores sociais adicionais e a capacidade de criar os seus próprios conectores usando os protocolos OIDC, OAuth 2.0 e SAML. Não hesite em <a>Entre em contato conosco</a> se precisar de ajuda.',
  standard_connectors_pro_other:
    'Atingiu o limite de {{count, number}} conectores padrão de <planName/>. Atualize para o plano Empresarial para obter conectores sociais adicionais e a capacidade de criar os seus próprios conectores usando os protocolos OIDC, OAuth 2.0 e SAML. Não hesite em <a>Entre em contato conosco</a> se precisar de ajuda.',
  roles:
    'Atingiu o limite de {{count, number}} funções de <planName/>. Atualize o plano para adicionar funções e permissões adicionais. Não hesite em <a>Entre em contato conosco</a> se precisar de ajuda.',
  roles_other:
    'Atingiu o limite de {{count, number}} funções de <planName/>. Atualize o plano para adicionar funções e permissões adicionais. Não hesite em <a>Entre em contato conosco</a> se precisar de ajuda.',
  machine_to_machine_roles:
    '{{count, number}} funções de máquina para máquina do <planName/> atingiram o limite. Atualize o plano para adicionar funções e permissões adicionais. Sinta-se à vontade para <a>entrar em contato conosco</a> se precisar de alguma ajuda.',
  machine_to_machine_roles_other:
    '{{count, number}} funções de máquina para máquina do <planName/> atingiram o limite. Atualize o plano para adicionar funções e permissões adicionais. Sinta-se à vontade para <a>entrar em contato conosco</a> se precisar de alguma ajuda.',
  scopes_per_role:
    'Atingiu o limite de {{count, number}} permissões por função de <planName/>. Atualize o plano para adicionar funções e permissões adicionais. Não hesite em <a>Entre em contato conosco</a> se precisar de ajuda.',
  scopes_per_role_other:
    'Atingiu o limite de {{count, number}} permissões por função de <planName/>. Atualize o plano para adicionar funções e permissões adicionais. Não hesite em <a>Entre em contato conosco</a> se precisar de ajuda.',
  hooks:
    'Atingiu o limite de {{count, number}} webhooks de <planName/>. Atualize o plano para criar mais webhooks. Não hesite em <a>Entre em contato conosco</a> se precisar de ajuda.',
  hooks_other:
    'Atingiu o limite de {{count, number}} webhooks de <planName/>. Atualize o plano para criar mais webhooks. Não hesite em <a>Entre em contato conosco</a> se precisar de ajuda.',
  mfa: 'Desbloqueie o MFA para verificar a segurança, fazendo upgrade para um plano pago. Não hesite em <a>nos contatar</a> se precisar de alguma assistência.',
  organizations:
    'Desbloqueie organizações ao fazer upgrade para um plano pago. Não hesite em <a>entrar em contato conosco</a> se precisar de alguma assistência.',
  third_party_apps:
    'Desbloqueie Logto como provedor de identidade para aplicativos de terceiros, ao fazer upgrade para um plano pago. Para qualquer ajuda, sinta-se à vontade para <a>entrar em contato conosco</a>.',
  sso_connectors:
    'Desbloqueie SSO corporativo ao fazer upgrade para um plano pago. Para qualquer ajuda, sinta-se à vontade para <a>entrar em contato conosco</a>.',
  tenant_members:
    'Desbloqueie a funcionalidade de colaboração ao fazer upgrade para um plano pago. Para qualquer ajuda, sinta-se à vontade para <a>entrar em contato conosco</a>.',
  tenant_members_dev_plan:
    'Você atingiu seu limite de {{limit}} membros. Libere um membro ou revogue um convite pendente para adicionar alguém novo. Precisa de mais vagas? Fale conosco.',
  custom_jwt: {
    title: 'Adicionar reivindicações personalizadas',
    description:
      'Atualize para um plano pago para funcionalidades de JWT personalizadas e benefícios premium. Não hesite em <a>entrar em contato conosco</a> se tiver alguma dúvida.',
  },
};

export default Object.freeze(paywall);
