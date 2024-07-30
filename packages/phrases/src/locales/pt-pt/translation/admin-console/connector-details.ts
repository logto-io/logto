const connector_details = {
  page_title: 'Detalhes do conector',
  back_to_connectors: 'Voltar para Conectores',
  check_readme: 'Verifique o README',
  settings: 'Configurações gerais',
  settings_description:
    'Os conectores desempenham um papel crítico no Logto. Com a sua ajuda, o Logto permite aos utilizadores finais utilizar o registo ou o início de sessão sem palavra-passe e as capacidades de iniciar sessão com contas sociais.',
  parameter_configuration: 'Configuração de parâmetros',
  test_connection: 'Testar',
  save_error_empty_config: 'Por favor, insira a configuração',
  send: 'Enviar',
  send_error_invalid_format: 'Entrada inválida',
  edit_config_label: 'Introduza o JSON aqui',
  test_email_sender: 'Testar o conector de e-mail',
  test_sms_sender: 'Testar o conector de SMS',
  test_email_placeholder: 'john.doe@example.com',
  test_sms_placeholder: '+351 912 345 678',
  test_message_sent: 'Mensagem de teste enviada',
  test_sender_description:
    'O Logto utiliza o modelo "Genérico" para os testes. Você receberá uma mensagem se o seu conector estiver configurado corretamente.',
  options_change_email: 'Alterar conector de e-mail',
  options_change_sms: 'Alterar conector de SMS',
  connector_deleted: 'O conector foi removido com sucesso',
  type_email: 'Conector de E-mail',
  type_sms: 'Conector de SMS',
  type_social: 'Conector Social',
  in_used_social_deletion_description:
    'Este conector está em uso na sua experiência de início de sessão. Ao excluir, a experiência de início de sessão <name/> será excluída nas configurações da experiência de início de sessão. Você precisará reconfigurá-lo se decidir adicioná-lo de volta.',
  in_used_passwordless_deletion_description:
    'Este {{name}} está em uso na sua experiência de início de sessão. Ao excluir, sua experiência de início de sessão não funcionará corretamente até que você resolva o conflito. Você precisará reconfigurá-lo se decidir adicioná-lo de volta.',
  deletion_description:
    'Você está removendo este conector. Isso não pode ser desfeito, e você precisará reconfigurá-lo se decidir adicioná-lo de volta.',
  logto_email: {
    total_email_sent: 'Total de emails enviados: {{value, number}}',
    total_email_sent_tip:
      'Logto utiliza o SendGrid para e-mail interno seguro e estável. É completamente gratuito para usar. <a>Saiba mais</a>',
    email_template_title: 'Modelo de e-mail',
    template_description:
      'O e-mail integrado usa modelos padrão para entrega perfeita de e-mails de verificação. Nenhuma configuração é necessária e você pode personalizar informações básicas da marca.',
    template_description_link_text: 'Ver modelos',
    description_action_text: 'Ver modelos',
    from_email_field: 'De e-mail',
    sender_name_field: 'Nome do remetente',
    sender_name_tip:
      'Personalize o nome do remetente para e-mails. Se deixado em branco, "Verification" será usado como nome padrão.',
    sender_name_placeholder: 'Seu nome do remetente',
    company_information_field: 'Informação da empresa',
    company_information_description:
      'Exiba o nome da sua empresa, endereço ou código postal no rodapé dos e-mails para aumentar a autenticidade.',
    company_information_placeholder: 'Informação básica da empresa',
    email_logo_field: 'Logotipo do e-mail',
    email_logo_tip:
      'Exiba o logotipo da sua marca no topo dos e-mails. Use a mesma imagem para ambos os modos: claro e escuro.',
    urls_not_allowed: 'Os URLs não são permitidos',
    test_notes: 'O Logto utiliza o modelo "Genérico" para os testes.',
  },
  google_one_tap: {
    title: 'Google One Tap',
    description:
      'Google One Tap é uma forma segura e fácil de os utilizadores entrarem no seu site.',
    enable_google_one_tap: 'Ativar Google One Tap',
    enable_google_one_tap_description:
      'Ative o Google One Tap na sua experiência de início de sessão: Permita que os utilizadores se inscrevam ou entrem rapidamente com a conta Google deles se já estiverem ligados no dispositivo.',
    configure_google_one_tap: 'Configurar Google One Tap',
    auto_select: 'Selecionar automaticamente a credencial, se possível',
    close_on_tap_outside: 'Cancelar o prompt se o utilizador clicar/tocar fora',
    itp_support: 'Ativar <a>UX One Tap Melhorado em navegadores ITP</a>',
  },
};

export default Object.freeze(connector_details);
