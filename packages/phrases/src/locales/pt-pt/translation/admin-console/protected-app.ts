const protected_app = {
  name: 'App Protegida',
  title: 'Crie uma App Protegida: Adicione autenticação com simplicidade e velocidade épica',
  fast_create: 'Criar rapidamente',
  modal_title: 'Criar App Protegida',
  modal_subtitle:
    'Habilitar proteção segura e rápida com alguns cliques. Adicione autenticação ao seu aplicativo da web existente com facilidade.',
  form: {
    url_field_label: 'O URL de origem',
    url_field_placeholder: 'https://domínio.com/',
    url_field_description:
      'Forneça o endereço do seu aplicativo que necessita de proteção de autenticação.',
    url_field_modification_notice:
      'Modificações no URL de origem podem levar de 1-2 minutos para se tornarem eficazes em todas as localizações da rede global.',
    url_field_tooltip:
      "Forneça o endereço da sua aplicação, excluindo qualquer '/caminho'. Após a criação, você pode personalizar as regras de autenticação de rota.\n\nObservação: O próprio URL de origem não necessita de autenticação; a proteção é aplicada exclusivamente a acessos via o domínio do aplicativo designado.",
    domain_field_label: 'Domínio do aplicativo',
    domain_field_placeholder: 'seu-domínio',
    domain_field_description:
      'Este URL serve como um proxy de proteção de autenticação para o URL original. O domínio personalizado pode ser aplicado após a criação.',
    domain_field_description_short:
      'Este URL serve como um proxy de proteção de autenticação para o URL original.',
    domain_field_tooltip:
      "Apps protegidos pelo Logto serão hospedados em 'seu-domínio.{{domain}}' por padrão. O domínio personalizado pode ser aplicado após a criação.",
    create_application: 'Criar aplicativo',
    create_protected_app: 'Criar rapidamente',
    errors: {
      domain_required: 'O seu domínio é obrigatório.',
      domain_in_use: 'Este nome de subdomínio já está em uso.',
      invalid_domain_format:
        "Formato de subdomínio inválido: use apenas letras minúsculas, números e hífens '-'.",
      url_required: 'O URL de origem é obrigatório.',
      invalid_url:
        "Formato de URL de origem inválido: Use http:// ou https://. Observação: '/caminho' não é suportado atualmente.",
      localhost:
        'Por favor, exponha primeiro o seu servidor local à internet. Saiba mais sobre o <a>desenvolvimento local</a>.',
    },
  },
  id_token_claims: {
    card_title: 'Claims do ID token',
    card_description:
      'Solicite scopes de utilizador adicionais durante o início de sessão da App Protegida para incluir claims estendidos ativados no ID token encaminhado.',
    field_title: 'Scopes adicionais',
    field_description:
      'Os claims só são incluídos quando estão ativados em <a>Custom JWT > ID token</a> e o scope correspondente é solicitado aqui.',
    table_column_scope: 'Scope',
    table_column_claims_forwarded: 'Claims encaminhados',
    disabled_claims_hint:
      'Os claims a cinzento ainda não são encaminhados. Ative-os em <a>Custom JWT > ID token</a> para incluí-los no ID token.',
  },
  success_message:
    '🎉 Autenticação do aplicativo habilitada com sucesso! Explore a nova experiência do seu site.',
};

export default Object.freeze(protected_app);
