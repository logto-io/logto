const organizations = {
  organization: 'Organização',
  page_title: 'Organizações',
  title: 'Organizações',
  subtitle:
    'Uma organização é um conjunto de utilizadores que inclui equipas, clientes empresariais e empresas parceiras que utilizam as suas aplicações.',
  organization_template: 'Modelo de organização',
  organization_id: 'ID da organização',
  members: 'Membros',
  create_organization: 'Criar organização',
  setup_organization: 'Configurar a sua organização',
  organization_list_placeholder_title: 'Organização',
  organization_list_placeholder_text:
    'A organização é normalmente usada em aplicações multi-inquilinos de SaaS ou semelhantes a SaaS. A funcionalidade Organizações permite que os seus clientes B2B gerenciem melhor os seus parceiros e clientes, e personalizem as formas como os utilizadores finais acedem às suas aplicações.',
  organization_name_placeholder: 'A minha organização',
  organization_description_placeholder: 'Uma breve descrição da organização',
  organization_permission: 'Permissão da organização',
  organization_permission_other: 'Permissões da organização',
  organization_permission_description:
    'A permissão da organização refere-se à autorização para aceder a um recurso no contexto da organização. Uma permissão da organização deve ser representada como uma string significativa, servindo também como nome e identificador único.',
  organization_permission_delete_confirm:
    'Se esta permissão for eliminada, todas as funções da organização que incluam esta permissão perderão esta permissão, e os utilizadores que tinham esta permissão perderão o acesso concedido por ela.',
  create_permission_placeholder: 'Ler histórico de compromissos',
  permission: 'Permissão',
  permission_other: 'Permissões',
  organization_role: 'Papel da organização',
  organization_role_other: 'Funções da organização',
  organization_role_description:
    'O papel da organização é um agrupamento de permissões que podem ser atribuídas a utilizadores. As permissões devem provir das permissões de organização predefinidas.',
  organization_role_delete_confirm:
    'Fazê-lo removerá as permissões associadas a este papel dos usuários afetados e excluirá as relações entre os papéis da organização, os membros da organização e as permissões da organização.',
  role: 'Função',
  create_role_placeholder: 'Usuários com permissões somente leitura',
  search_placeholder: 'Pesquisar por nome ou ID da organização',
  search_permission_placeholder: 'Digite para pesquisar e selecionar permissões',
  search_role_placeholder: 'Digite para pesquisar e selecionar funções',
  empty_placeholder: '🤔 Ainda não configurou nenhum {{entity}}.',
  organization_and_member: 'Organização e membro',
  organization_and_member_description:
    'Uma organização é um grupo de utilizadores e pode representar as equipas, clientes empresariais e empresas parceiras, estando cada utilizador a ser um "Membro". Estes podem ser entidades fundamentais para lidar com os seus requisitos multi-inquilinos.',
  guide: {
    title: 'Comece com guias',
    subtitle: 'Inicie as definições da sua organização com os nossos guias',
    introduction: {
      title: 'Vamos entender como funciona a organização no Logto',
      section_1: {
        title: 'Uma organização é um grupo de utilizadores (identidades)',
      },
      section_2: {
        title:
          'O modelo de organização é projetado para o controle de acesso de aplicações multi-inquilinos',
        description:
          'Em aplicações SaaS multi-inquilinos, várias organizações frequentemente partilham o mesmo modelo de controlo de acesso, que inclui permissões e funções. No Logto, chamamos-lhe "modelo de organização".',
        permission_description:
          'A permissão de organização refere-se à autorização para aceder a um recurso no contexto da organização.',
        role_description:
          'O papel da organização é um agrupamento de permissões de organização que podem ser atribuídas aos membros.',
      },
      section_3: {
        title: 'Interaja com a ilustração para ver como tudo está conectado',
        description:
          'Vamos pegar um exemplo. John, Sarah estão em diferentes organizações com funções diferentes no contexto de diferentes organizações. Passe o cursor sobre os diferentes módulos e veja o que acontece.',
      },
    },
    step_1: 'Passo 1: Definir as permissões da organização',
    step_2: 'Passo 2: Definir as funções da organização',
    step_3: 'Passo 3: Crie a sua primeira organização',
    step_3_description:
      'Vamos criar a sua primeira organização. Ela vem com um ID único e serve como contentor para lidar com várias identidades mais direcionadas para os negócios.',
    more_next_steps: 'Mais próximos passos',
    add_members: 'Adicionar membros à sua organização',
    add_members_action: 'Adicionar em massa membros e atribuir funções',
    organization_permissions: 'Permissões da organização',
    permission_name: 'Nome da permissão',
    permissions: 'Permissões',
    organization_roles: 'Funções da organização',
    role_name: 'Nome do papel',
    organization_name: 'Nome da organização',
    admin: 'Admin',
    member: 'Membro',
    guest: 'Convidado',
    role_description:
      'O papel "{{role}}" partilha o mesmo modelo de organização em diferentes organizações.',
    john: 'John',
    john_tip:
      'John pertence a duas organizações com o e-mail "john@email.com" como identificador único. Ele é o administrador da organização A, bem como o convidado da organização B.',
    sarah: 'Sarah',
    sarah_tip:
      'Sarah pertence a uma organização com o e-mail "sarah@email.com" como identificador único. Ela é a administradora da organização B.',
  },
};

export default Object.freeze(organizations);
