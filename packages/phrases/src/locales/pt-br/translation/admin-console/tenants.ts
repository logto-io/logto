const tenants = {
  create_modal: {
    title: 'Criar inquilino',
    subtitle: 'Crie um novo inquilino para separar recursos e usuários.',
    create_button: 'Criar inquilino',
    tenant_name: 'Nome do inquilino',
    tenant_name_placeholder: 'Meu inquilino',
    environment_tag: 'Tag de ambiente',
    environment_tag_description:
      'Use tags para diferenciar ambientes de uso de inquilino. Serviços dentro de cada tag são idênticos, garantindo consistência.',
    environment_tag_development: 'Desenvolvimento',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Produção',
  },
  delete_modal: {
    title: 'Excluir locatário',
    description_line1:
      'Tem certeza que deseja excluir seu locatário "<span>{{name}}</span>" com a etiqueta de sufixo de ambiente "<span>{{tag}}</span>"? Esta ação não pode ser desfeita e resultará na exclusão permanente de todos os seus dados e informações de conta.',
    description_line2:
      'Antes de excluir a conta, podemos ajudá-lo. <span><a>Entre em contato conosco por e-mail</a></span>',
    description_line3:
      'Se você deseja continuar, digite o nome do locatário "<span>{{name}}</span>" para confirmar.',
    delete_button: 'Excluir permanentemente',
  },
  tenant_created: "Inquilino '{{name}}' criado com sucesso.",
};

export default tenants;
