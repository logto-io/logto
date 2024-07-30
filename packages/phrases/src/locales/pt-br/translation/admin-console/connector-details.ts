const connector_details = {
  page_title: 'Detalhes do conector',
  back_to_connectors: 'Voltar para Conectores',
  check_readme: 'Visualize o README',
  settings: 'Configurações gerais',
  settings_description:
    'Os conectores desempenham um papel crítico no Logto. Com a ajuda deles, a Logto permite que os usuários finais usem o registro ou login sem senha e os recursos de login com contas sociais.',
  parameter_configuration: 'Configuração de parâmetros',
  test_connection: 'Testar conexão',
  save_error_empty_config: 'Por favor insira a configuração',
  send: 'Enviar',
  send_error_invalid_format: 'Campo inválido',
  edit_config_label: 'Digite seu json aqui',
  test_email_sender: 'Testar conexão de e-mail',
  test_sms_sender: 'Testar conexão SMS',
  test_email_placeholder: 'john.doe@example.com',
  test_sms_placeholder: '+55 11 9 1234-5678',
  test_message_sent: 'Mensagem de teste enviada',
  test_sender_description:
    'O Logto utiliza o modelo "Generic" para testes. Você receberá uma mensagem se o seu conector estiver configurado corretamente.',
  options_change_email: 'Alterar conector de e-mail',
  options_change_sms: 'Alterar conector de SMS',
  connector_deleted: 'O conector foi excluído com sucesso',
  type_email: 'Conector de e-mail',
  type_sms: 'Conector de SMS',
  type_social: 'Conector social',
  in_used_social_deletion_description:
    'Este conector está em uso em sua experiência de login. Ao excluí-lo, a experiência de login <name/> será excluída nas configurações de experiência de login. Você precisará reconfigurá-lo se decidir adicioná-lo novamente.',
  in_used_passwordless_deletion_description:
    'Este {{name}} está em uso em sua experiência de login. Ao excluí-lo, sua experiência de login não funcionará corretamente até que você resolva o conflito. Você precisará reconfigurá-lo se decidir adicioná-lo novamente.',
  deletion_description:
    'Você está removendo este conector. Isso não pode ser desfeito e você precisará reconfigurá-lo se decidir adicioná-lo novamente.',
  logto_email: {
    total_email_sent: 'Total de e-mails enviados: {{value, number}}',
    total_email_sent_tip:
      'Logto utiliza SendGrid para envio seguro e estável de e-mails integrados. É completamente gratuito para uso. <a>Saiba mais</a>',
    email_template_title: 'Modelo de e-mail',
    template_description:
      'O e-mail integrado usa modelos padrão para entrega perfeita de e-mails de verificação. Nenhuma configuração é necessária e você pode personalizar informações básicas da marca.',
    template_description_link_text: 'Visualizar modelos',
    description_action_text: 'Ver modelos',
    from_email_field: 'E-mail do remetente',
    sender_name_field: 'Nome do remetente',
    sender_name_tip:
      'Personalize o nome do remetente para e-mails. Se deixado em branco, "Verification" será usado como nome padrão.',
    sender_name_placeholder: 'Seu nome de remetente',
    company_information_field: 'Informações da empresa',
    company_information_description:
      'Exiba o nome da sua empresa, endereço ou código postal no final dos e-mails para melhorar a autenticidade.',
    company_information_placeholder: 'Informações básicas da sua empresa',
    email_logo_field: 'Logo do email',
    email_logo_tip:
      'Exiba a logo da sua marca no topo dos e-mails. Use a mesma imagem para ambos os modos claro e escuro.',
    urls_not_allowed: 'URLs não permitidas',
    test_notes: 'Logto utiliza o modelo "Genérico" para testes.',
  },
  google_one_tap: {
    title: 'Google One Tap',
    description:
      'Google One Tap é uma maneira segura e fácil para os usuários se conectarem ao seu site.',
    enable_google_one_tap: 'Ativar Google One Tap',
    enable_google_one_tap_description:
      'Ative o Google One Tap na sua experiência de login: Permita que os usuários se inscrevam ou conectem rapidamente com a conta Google deles, se eles já estiverem logados em seus dispositivos.',
    configure_google_one_tap: 'Configurar Google One Tap',
    auto_select: 'Selecionar credencial automaticamente se possível',
    close_on_tap_outside: 'Cancelar o prompt se o usuário clicar/tocar fora',
    itp_support: 'Ativar <a>UX Melhorado do One Tap em navegadores ITP</a>',
  },
};

export default Object.freeze(connector_details);
