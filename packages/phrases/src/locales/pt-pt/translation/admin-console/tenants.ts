const tenants = {
  create_modal: {
    title: 'Criar inquilino',
    subtitle: 'Crie um novo inquilino para separar recursos e utilizadores.',
    create_button: 'Criar inquilino',
    tenant_name: 'Nome do inquilino',
    tenant_name_placeholder: 'Meu inquilino',
    environment_tag: 'Etiqueta de ambiente',
    environment_tag_description:
      'Os serviços com etiquetas diferentes são idênticos. Funciona como um sufixo para ajudar a sua equipa a diferenciar ambientes.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
  },
  delete_modal: {
    title: 'Eliminar inquilino',
    description_line1:
      'Tem a certeza de que pretende eliminar o seu inquilino "<span>{{name}}</span>" com a etiqueta de sufixo de ambiente "<span>{{tag}}</span>"? Esta ação não pode ser desfeita e resultará na eliminação permanente de todos os seus dados e informações da conta.',
    description_line2:
      'Antes de eliminar a conta, podemos ajudá-lo. <span><a>Contacte-nos por email</a></span>',
    description_line3:
      'Se desejar continuar, introduza o nome do inquilino "<span>{{name}}</span>" para confirmar.',
    delete_button: 'Eliminar permanentemente',
  },
  tenant_landing_page: {
    title: 'Ainda não criou um inquilino',
    description:
      'Para começar a configurar o seu projeto com o Logto, crie um novo inquilino. Se precisar de fazer logout ou excluir a sua conta, basta clicar no botão avatar no canto superior direito.',
    create_tenant_button: 'Criar inquilino',
  },
};

export default tenants;
