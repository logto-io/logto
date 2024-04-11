const paywall = {
  applications:
    'Limite de {{count, number}} aplicação do <planName/> atingido. Atualize o plano para atender às necessidades da sua equipa. Para obter qualquer ajuda, sinta-se à vontade para <a>entrar em contato conosco</a>.',
  applications_other:
    'Limite de {{count, number}} aplicações do <planName/> atingido. Atualize o plano para atender às necessidades da sua equipa. Para obter qualquer ajuda, sinta-se à vontade para <a>entrar em contato conosco</a>.',
  machine_to_machine_feature:
    'Mude para o plano <strong>Pro</strong> para obter aplicações adicionais de máquina a máquina e aproveitar todos os recursos premium. <a>Entre em contato conosco</a> se tiver dúvidas.',
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
    'Desbloqueie a funcionalidade de domínio personalizado ao atualizar para o plano <strong>Hobby</strong> ou <strong>Pro</strong>. Não hesite em <a>entrar em contato conosco</a> se precisar de qualquer assistência.',
  social_connectors:
    'Atingiu o limite de {{count, number}} conectores sociais de <planName/>. Atualize o plano para obter conectores sociais adicionais e a capacidade de criar os seus próprios conectores usando os protocolos OIDC, OAuth 2.0 e SAML. Não hesite em <a>Contacte-nos</a> se precisar de ajuda.',
  social_connectors_other:
    'Atingiu o limite de {{count, number}} conectores sociais de <planName/>. Atualize o plano para obter conectores sociais adicionais e a capacidade de criar os seus próprios conectores usando os protocolos OIDC, OAuth 2.0 e SAML. Não hesite em <a>Contacte-nos</a> se precisar de ajuda.',
  standard_connectors_feature:
    'Upgrade para os planos <strong>Hobby</strong> ou <strong>Pro</strong> para criar os seus próprios conectores usando os protocolos OIDC, OAuth 2.0 e SAML, além de conectores sociais ilimitados e todos os recursos premium. Sinta-se à vontade para <a>entrar em contato conosco</a> se precisar de qualquer assistência.',
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
  machine_to_machine_roles:
    '{{count, number}} papel de máquina a máquina de <planName/> atingido. Atualize o plano para adicionar papéis e permissões adicionais. Sinta-se à vontade para <a>entrar em contato conosco</a> se precisar de ajuda.',
  machine_to_machine_roles_other:
    '{{count, number}} papéis de máquina a máquina de <planName/> atingidos. Atualize o plano para adicionar papéis e permissões adicionais. Sinta-se à vontade para <a>entrar em contato conosco</a> se precisar de ajuda.',
  scopes_per_role:
    'Atingiu o limite de {{count, number}} permissões por função de <planName/>. Atualize o plano para adicionar funções e permissões adicionais. Não hesite em <a>Contacte-nos</a> se precisar de ajuda.',
  scopes_per_role_other:
    'Atingiu o limite de {{count, number}} permissões por função de <planName/>. Atualize o plano para adicionar funções e permissões adicionais. Não hesite em <a>Contacte-nos</a> se precisar de ajuda.',
  hooks:
    'Atingiu o limite de {{count, number}} webhooks de <planName/>. Atualize o plano para criar mais webhooks. Não hesite em <a>Contacte-nos</a> se precisar de ajuda.',
  hooks_other:
    'Atingiu o limite de {{count, number}} webhooks de <planName/>. Atualize o plano para criar mais webhooks. Não hesite em <a>Contacte-nos</a> se precisar de ajuda.',
  mfa: 'Desbloqueie o MFA para a verificação de segurança ao atualizar para um plano pago. Não hesite em <a>entrar em contato conosco</a> se precisar de assistência.',
  organizations:
    'Desbloquear organizações ao atualizar para um plano pago. Não hesite em <a>entrar em contato conosco</a> se precisar de assistência.',
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
