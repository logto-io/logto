const inline_hooks = {
  page_title: 'Hooks inline',
  title: 'Hooks inline',
  subtitle:
    'Execute código personalizado em pontos específicos do fluxo de autenticação para estender o comportamento do Logto.',
  status: {
    not_configured: 'Não configurado',
    configured: 'Configurado',
    enabled: 'Ativado',
    disabled: 'Desativado',
  },
  hooks: {
    post_first_factor_verification: {
      name: 'Após a verificação do primeiro fator',
      description:
        'Execute lógica personalizada após a verificação do primeiro fator de autenticação e antes de o login continuar.',
    },
    post_sign_in: {
      name: 'Após o login',
      description: 'Execute lógica personalizada após um usuário entrar com sucesso.',
    },
  },
};

export default Object.freeze(inline_hooks);
