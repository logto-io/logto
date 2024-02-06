const organizations = {
  organization: 'Organização',
  page_title: 'Organizações',
  title: 'Organizações',
  subtitle:
    'Uma organização é uma coleção de usuários que inclui equipes, clientes comerciais e empresas parceiras que usam suas aplicações.',
  organization_template: 'Modelo de organização',
  organization_id: 'ID da organização',
  members: 'Membros',
  create_organization: 'Criar organização',
  setup_organization: 'Configurar sua organização',
  organization_list_placeholder_title: 'Organização',
  organization_list_placeholder_text:
    'A organização é geralmente usada em aplicativos de multi-inquilinato SaaS ou semelhantes a SaaS. A funcionalidade de Organizações permite que seus clientes B2B gerenciem melhor seus parceiros e clientes, e personalizem as formas como os usuários finais acessam suas aplicações.',
  organization_name_placeholder: 'Minha organização',
  organization_description_placeholder: 'Uma breve descrição da organização',
  organization_permission: 'Permissão da organização',
  organization_permission_other: 'Permissões da organização',
  organization_permission_description:
    'A permissão da organização se refere à autorização para acessar um recurso no contexto da organização. Uma permissão de organização deve ser representada como uma string significativa, servindo também como nome e identificador exclusivo.',
  organization_permission_delete_confirm:
    'Se esta permissão for excluída, todos os papéis de organização, incluindo esta permissão, perderão esta permissão, e os usuários que tinham esta permissão perderão o acesso concedido por ela.',
  create_permission_placeholder: 'Ler histórico de compromissos',
  permission: 'Permissão',
  permission_other: 'Permissões',
  organization_role: 'Papel da organização',
  organization_role_other: 'Papéis da organização',
  organization_role_description:
    'O papel da organização é um agrupamento de permissões que podem ser atribuídas aos usuários. As permissões devem vir das permissões de organização predefinidas.',
  organization_role_delete_confirm:
    'Fazê-lo removerá as permissões associadas a este papel dos usuários afetados e excluirá as relações entre os papéis da organização, os membros da organização e as permissões da organização.',
  role: 'Função',
  create_role_placeholder: 'Usuários com permissões somente leitura',
  search_placeholder: 'Pesquisar por nome ou ID da organização',
  search_permission_placeholder: 'Digite para pesquisar e selecionar permissões',
  search_role_placeholder: 'Digite para pesquisar e selecionar funções',
  empty_placeholder: '🤔 Você ainda não configurou nenhum {{entity}}.',
  organization_and_member: 'Organização e membro',
  organization_and_member_description:
    'A organização é um grupo de usuários e pode representar as equipes, clientes comerciais e empresas parceiras, sendo que cada usuário é um "Membro".  Esses podem ser entidades fundamentais para lidar com seus requisitos de multi-inquilino.',
  guide: {
    title: 'Comece com guias',
    subtitle: 'Inicie as configurações da sua organização com nossos guias',
    introduction: {
      title: 'Vamos entender como a organização funciona no Logto',
      section_1: {
        title: 'Uma organização é um grupo de usuários (identidades)',
      },
      section_2: {
        title:
          'O modelo de organização é projetado para controle de acesso de aplicativos multi-inquilino',
        description:
          'Em aplicativos SaaS multi-inquilino, várias organizações frequentemente compartilham o mesmo modelo de controle de acesso, que inclui permissões e papéis. No Logto, chamamos isso de "modelo de organização".',
        permission_description:
          'A permissão da organização refere-se à autorização para acessar um recurso no contexto da organização.',
        role_description:
          'O papel da organização é um agrupamento de permissões da organização que podem ser atribuídas aos membros.',
      },
      section_3: {
        title: 'Interaja com a ilustração para ver como tudo se conecta',
        description:
          'Vamos dar um exemplo. John, Sarah estão em diferentes organizações com diferentes papéis no contexto de organizações diferentes. Passe o mouse sobre os diferentes módulos e veja o que acontece.',
      },
    },
    step_1: 'Etapa 1: Definir permissões da organização',
    step_2: 'Etapa 2: Definir papéis da organização',
    step_3: 'Etapa 3: Criar sua primeira organização',
    step_3_description:
      'Vamos criar a sua primeira organização. Ela vem com um ID único e serve como um contêiner para lidar com várias identidades direcionadas aos negócios.',
    more_next_steps: 'Próximas etapas',
    add_members: 'Adicionar membros à sua organização',
    /** UNTRANSLATED */
    config_organization: 'Configure organization',
    organization_permissions: 'Permissões da organização',
    permission_name: 'Nome da permissão',
    permissions: 'Permissões',
    organization_roles: 'Papéis da organização',
    role_name: 'Nome do papel',
    organization_name: 'Nome da organização',
    admin: 'Administrador',
    member: 'Membro',
    guest: 'Convidado',
    role_description:
      'O papel "{{role}}" compartilha o mesmo modelo de organização em diferentes organizações.',
    john: 'John',
    john_tip:
      'John pertence a duas organizações com o email "john@email.com" como único identificador. Ele é o administrador da organização A, bem como o convidado da organização B.',
    sarah: 'Sarah',
    sarah_tip:
      'Sarah pertence a uma organização com o email "sarah@email.com" como único identificador. Ela é a administradora da organização B.',
  },
};

export default Object.freeze(organizations);
