const connector_details = {
  back_to_connectors: 'Voltar para Conectores',
  check_readme: 'Visualize o README',
  settings: 'General settings', // UNTRANSLATED
  settings_description:
    'Os conectores desempenham um papel crítico no Logto. Com a ajuda deles, a Logto permite que os usuários finais usem o registro ou login sem senha e os recursos de login com contas sociais.',
  parameter_configuration: 'Parameter configuration', // UNTRANSLATED
  test_connection: 'Test connection', // UNTRANSLATED
  save_error_empty_config: 'Por favor insira a configuração',
  send: 'Enviar',
  send_error_invalid_format: 'Campo inválido',
  edit_config_label: 'Digite seu json aqui',
  test_email_sender: 'Teste seu conector de e-mail',
  test_sms_sender: 'Teste seu conector SMS',
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
    'This connector is in-use in your sign in experience. By deleting, <name/> sign in experience will be deleted in sign in experience settings. You will need to reconfigure it if you decide to add it back.', // UNTRANSLATED
  in_used_passwordless_deletion_description:
    'This {{name}} is in-use in your sign-in experience. By deleting, your sign-in experience will not work properly until you resolve the conflict. You will need to reconfigure it if you decide to add it back.', // UNTRANSLATED
  deletion_description:
    'You are removing this connector. It cannot be undone, and you will need to configure it manually if you decide to add it back.', // UNTRANSLATED
};

export default connector_details;
