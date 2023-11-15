const organizations = {
  page_title: 'Organizações',
  title: 'Organizações',
  subtitle:
    'Represente as equipes, clientes empresariais e empresas parceiras que acessam suas aplicações como organizações.',
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
  guide: {
    title: 'Comece com guias',
    subtitle: 'Inicie o processo de desenvolvimento do seu aplicativo com nossos guias',
    introduction: {
      section_1: {
        title: 'Primeiro, entenda como as organizações funcionam no Logto',
        description:
          'Em aplicativos SaaS de vários inquilinos, muitas vezes fazemos várias organizações com o mesmo conjunto de permissões e funções, mas no contexto de uma organização, ela pode desempenhar um papel importante no controle de diferentes níveis de acesso. Pense em cada inquilino como uma organização Logto e elas naturalmente compartilham o mesmo "modelo" de controle de acesso.',
      },
      section_2: {
        title: 'O modelo de organização consiste em duas partes',
        organization_permission_description:
          'A permissão de organização se refere à autorização para acessar um recurso no contexto da organização. Uma permissão de organização deve ser representada como uma string significativa, servindo também como nome e identificador exclusivo.',
        organization_role_description:
          'O papel da organização é um agrupamento de permissões que podem ser atribuídas aos usuários. As permissões devem vir das permissões de organização predefinidas.',
      },
      section_3: {
        title: 'Interaja com a ilustração para ver como tudo se conecta',
        description:
          'Vamos dar um exemplo. John, Sarah e Tony estão em diferentes organizações com papéis diferentes no contexto de organizações diferentes. Passe o mouse sobre os diferentes módulos e veja o que acontece.',
      },
    },
    step_1: 'Etapa 1: Definir permissões da organização',
    step_2: 'Etapa 2: Definir papéis da organização',
    step_2_description:
      '"Papéis da organização" representam um conjunto de papéis dados a cada organização no início. Esses papéis são determinados pelas permissões globais que você definiu na tela anterior. Semelhante à permissão de organização, uma vez que você terminar esta configuração pela primeira vez, não será necessário fazer isso toda vez que criar uma nova organização.',
    step_3: 'Etapa 3: Criar sua primeira organização',
    step_3_description:
      'Vamos criar sua primeira organização. Ela vem com um ID único e serve como um contêiner para lidar com várias identidades mais direcionadas aos negócios, como parceiros, clientes e seu controle de acesso.',
    more_next_steps: 'Mais próximas etapas',
    add_members: 'Adicionar membros à sua organização',
    add_members_action: 'Adicionar membros em massa e atribuir funções',
    add_enterprise_connector: 'Adicionar SSO empresarial',
    add_enterprise_connector_action: 'Configurar SSO empresarial',
    organization_permissions: 'Permissões da organização',
    permission_name: 'Nome da permissão',
    permissions: 'Permissões',
    organization_roles: 'Papéis da organização',
    role_name: 'Nome do papel',
    organization_name: 'Nome da organização',
    admin: 'Administrador',
    admin_description:
      'O papel "Administrador" compartilha o mesmo modelo de organização em diferentes organizações.',
    member: 'Membro',
    member_description:
      'O papel "Membro" compartilha o mesmo modelo de organização em diferentes organizações.',
    guest: 'Convidado',
    guest_description:
      'O papel "Convidado" compartilha o mesmo modelo de organização em diferentes organizações.',
    create_more_roles:
      'Você pode criar mais papéis nas configurações de modelo da organização. Esses papéis da organização se aplicarão a diferentes organizações.',
    read_resource: 'ler:recurso',
    edit_resource: 'editar:recurso',
    delete_resource: 'excluir:recurso',
    ellipsis: '...',
    johnny:
      'Johnny pertence a duas organizações com o email "john@email.com" como único identificador. Ele é o administrador da organização A e convidado da organização B.',
    sarah:
      'Sarah pertence a uma organização com o email "sarah@email.com" como único identificador. Ela é a administradora da organização B.',
    tony: 'Tony pertence a uma organização com o email "tony@email.com" como único identificador. Ele é membro da organização C.',
  },
};

export default Object.freeze(organizations);
