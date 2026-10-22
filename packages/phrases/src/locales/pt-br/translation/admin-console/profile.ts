const profile = {
  link_account: {
    anonymous: 'Anônimo',
  },

  delete_account: {
    title: 'EXCLUIR CONTA',
    label: 'Excluir conta',
    description:
      'Excluir sua conta removerá todas as suas informações pessoais, dados do usuário e configurações. Essa ação não pode ser desfeita.',
    button: 'Excluir conta',
    p: {
      has_issue:
        'Lamentamos saber que você deseja excluir sua conta. Antes de poder excluir sua conta, você precisa resolver os seguintes problemas.',
      after_resolved:
        'Assim que resolver os problemas, você poderá excluir sua conta. Não hesite em nos contatar se precisar de alguma assistência.',
      check_information:
        'Lamentamos saber que você deseja excluir sua conta. Por favor, verifique as seguintes informações com cuidado antes de prosseguir.',
      remove_all_data:
        'Excluir sua conta removerá permanentemente todos os dados sobre você na Logto Cloud. Portanto, certifique-se de fazer backup de quaisquer dados importantes antes de prosseguir.',
      confirm_information:
        'Por favor, confirme que as informações acima são o que você esperava. Depois de excluir sua conta, não poderemos recuperá-la.',
    },
    issues: {
      tenants:
        'Antes de excluir sua conta, exclua ou saia de cada tenant abaixo na página de configurações dele:',
      console_sso: 'Remova todos os conectores do Console SSO da sua conta antes de excluí-la.',
    },
    error_occurred: 'Ocorreu um erro',
    error_occurred_description: 'Desculpe, algo deu errado ao excluir sua conta:',
    request_id: 'ID da solicitação: {{requestId}}',
    try_again_later:
      'Por favor, tente novamente mais tarde. Se o problema persistir, entre em contato com a equipe Logto com o ID da solicitação.',
    final_confirmation: 'Confirmação final',
    about_to_start_deletion:
      'Você está prestes a iniciar o processo de exclusão e essa ação não pode ser desfeita.',
    permanently_delete: 'Excluir permanentemente',
  },

  fields: {
    name: 'Nome',
    name_description:
      'O nome completo do usuário em formato exibível, incluindo todos os componentes do nome (por exemplo, "João Silva").',
    avatar: 'Avatar',
    avatar_description: 'URL da imagem do avatar do usuário.',
    familyName: 'Sobrenome',
    familyName_description: 'O sobrenome do usuário (por exemplo, "Silva").',
    givenName: 'Nome',
    givenName_description: 'O nome do usuário (por exemplo, "João").',
    middleName: 'Nome do meio',
    middleName_description: 'O nome do meio do usuário (por exemplo, "Carlos").',
    nickname: 'Apelido',
    nickname_description: 'Nome casual ou familiar do usuário, que pode diferir do nome legal.',
    preferredUsername: 'Nome de usuário preferido',
    preferredUsername_description:
      'Identificador abreviado pelo qual o usuário deseja ser referenciado.',
    profile: 'Perfil',
    profile_description:
      'URL da página de perfil legível do usuário (por exemplo, perfil de mídia social).',
    website: 'Site',
    website_description: 'URL do site pessoal ou blog do usuário.',
    gender: 'Gênero',
    gender_description:
      'O gênero autoidentificado do usuário (por exemplo, "Feminino", "Masculino", "Não-binário").',
    birthdate: 'Data de nascimento',
    birthdate_description:
      'A data de nascimento do usuário em um formato específico (por exemplo, "dd-MM-yyyy").',
    zoneinfo: 'Fuso horário',
    zoneinfo_description:
      'O fuso horário do usuário no formato IANA (por exemplo, "America/Sao_Paulo" ou "Europe/Lisbon").',
    locale: 'Idioma',
    locale_description:
      'O idioma do usuário no formato IETF BCP 47 (por exemplo, "pt-BR" ou "en-US").',
    address: {
      formatted: 'Endereço',
      streetAddress: 'Endereço',
      locality: 'Cidade',
      region: 'Estado',
      postalCode: 'CEP',
      country: 'País',
    },
    address_description:
      'O endereço completo do usuário em formato exibível, incluindo todos os componentes do endereço (por exemplo, "Rua Principal, 123, Cidade, Brasil 12345-678").',
    fullname: 'Nome completo',
    fullname_description:
      'Combina flexivelmente sobrenome, nome e nome do meio com base na configuração.',
  },
};

export default Object.freeze(profile);
