const protected_app = {
  name: 'Aplicativo Protegido',
  title:
    'Crie um Aplicativo Protegido: Adicione autenticação com simplicidade e velocidade incrível',
  description:
    'O Aplicativo Protegido mantém sessões de usuários de forma segura e encaminha as solicitações do seu aplicativo. Potencializado pelos Cloudflare Workers, desfrute do desempenho de alto nível e início instantâneo de 0ms em todo o mundo. <a> Aprenda mais </a>',
  fast_create: 'Criação rápida',
  modal_title: 'Criar Aplicativo Protegido',
  modal_subtitle:
    'Ative a proteção segura e rápida com alguns cliques. Adicione autenticação ao seu aplicativo web existente com facilidade.',
  form: {
    url_field_label: 'Seu URL de origem',
    url_field_placeholder: 'https://dominio.com/',
    url_field_description:
      'Informe o endereço do seu aplicativo que requer proteção de autenticação.',
    url_field_modification_notice:
      'As modificações no URL de origem podem levar de 1 a 2 minutos para se tornarem efetivas em todas as localizações da rede global.',
    url_field_tooltip:
      "Forneça o endereço da sua aplicação, excluindo '/caminho'. Após a criação, você pode personalizar as regras de autenticação da rota.\n\nNota: O URL de origem em si não exige autenticação; a proteção é aplicada exclusivamente aos acessos por meio do domínio do aplicativo designado.",
    domain_field_label: 'Domínio do aplicativo',
    domain_field_placeholder: 'seu-domínio',
    domain_field_description:
      'Este URL funciona como um proxy de proteção de autenticação para o URL original. Domínio personalizado pode ser aplicado após a criação.',
    domain_field_description_short:
      'Este URL funciona como um proxy de proteção de autenticação para o URL original.',
    domain_field_tooltip:
      "Aplicativos protegidos pela Logto serão hospedados em 'seu-domínio.{{domain}}' por padrão. Domínio personalizado pode ser aplicado após a criação.",
    create_application: 'Criar aplicativo',
    create_protected_app: 'Criação rápida',
    errors: {
      domain_required: 'O seu domínio é obrigatório.',
      domain_in_use: 'Este nome de subdomínio já está em uso.',
      invalid_domain_format:
        "Formato de subdomínio inválido: use apenas letras minúsculas, números e hífens '-'.",
      url_required: 'O URL de origem é obrigatório.',
      invalid_url:
        "Formato de URL de origem inválido: Use http:// ou https://. Observação: '/caminho' não é suportado atualmente.",
      localhost:
        'Por favor, exponha seu servidor local para a Internet primeiro. Saiba mais sobre o <a> desenvolvimento local </a>.',
    },
  },
  success_message:
    '🎉 Autenticação de aplicativo habilitada com sucesso! Explore a nova experiência do seu site.',
};

export default Object.freeze(protected_app);
