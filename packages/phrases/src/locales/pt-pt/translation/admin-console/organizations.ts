const organizations = {
  page_title: 'Organizações',
  title: 'Organizações',
  subtitle:
    'Representam as equipas, clientes empresariais e empresas parceiras que acedem às suas aplicações como organizações.',
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
    'Ao fazer isto, serão removidas as permissões associadas a esta função dos utilizadores afetados e serão eliminadas as relações entre funções de organização, membros na organização e permissões da organização.',
  role: 'Papel',
  create_role_placeholder: 'Utilizadores com permissões apenas de visualização',
  search_placeholder: 'Pesquisar por nome ou ID da organização',
  search_permission_placeholder: 'Digite para pesquisar e selecionar permissões',
  search_role_placeholder: 'Digite para pesquisar e selecionar funções',
  guide: {
    title: 'Comece com guias',
    subtitle: 'Inicie o seu processo de desenvolvimento de aplicações com os nossos guias',
    introduction: {
      section_1: {
        title: 'Primeiro, vamos entender como funcionam as organizações no Logto',
        description:
          'Em aplicações SaaS multi-inquilinos, frequentemente criamos várias organizações com o mesmo conjunto de permissões e funções, mas no contexto de uma organização, estas podem desempenhar um papel importante no controlo de vários níveis de acesso. Pense em cada inquilino como uma organização Logto e elas naturalmente partilham o mesmo "modelo" de controlo de acesso. Chamamos a isso o "modelo da organização".',
      },
      section_2: {
        title: 'O modelo da organização consiste em duas partes',
        organization_permission_description:
          'A permissão da organização refere-se à autorização para aceder a um recurso no contexto da organização. Uma permissão da organização deve ser representada como uma string significativa, servindo também como nome e identificador único.',
        organization_role_description:
          'O papel da organização é um agrupamento de permissões que podem ser atribuídas a utilizadores. As permissões devem provir das permissões de organização predefinidas.',
      },
      section_3: {
        title: 'Interaja com a ilustração para ver como tudo está conectado',
        description:
          'Vamos dar um exemplo. John, Sarah e Tony estão em diferentes organizações com papéis diferentes no contexto de diferentes organizações. Passe o cursor sobre os diferentes módulos e veja o que acontece.',
      },
    },
    step_1: 'Passo 1: Definir as permissões da organização',
    step_2: 'Passo 2: Definir as funções da organização',
    step_2_description:
      '"Funções da organização" representam um conjunto de funções atribuídas a cada organização no início. Estas funções são determinadas pelas permissões globais que definiu no ecrã anterior. Semelhante à permissão da org, uma vez concluída esta configuração pela primeira vez, não precisará de o fazer sempre que criar uma nova organização.',
    step_3: 'Passo 3: Crie a sua primeira organização',
    step_3_description:
      'Vamos criar a sua primeira organização. Ela vem com um ID único e serve como um recipiente para lidar com várias identidades empresariais, como parceiros, clientes e respetivo controlo de acesso.',
    more_next_steps: 'Mais passos seguintes',
    add_members: 'Adicionar membros à sua organização',
    add_members_action: 'Adicionar membros em massa e atribuir funções',
    add_enterprise_connector: 'Adicionar SSO empresarial',
    add_enterprise_connector_action: 'Configurar SSO empresarial',
    organization_permissions: 'Permissões da organização',
    permission_name: 'Nome da permissão',
    permissions: 'Permissões',
    organization_roles: 'Funções da organização',
    role_name: 'Nome da função',
    organization_name: 'Nome da organização',
    admin: 'Administrador',
    admin_description:
      'A função "Administrador" partilha o mesmo modelo de organização em diferentes organizações.',
    member: 'Membro',
    member_description:
      'A função "Membro" partilha o mesmo modelo de organização em diferentes organizações.',
    guest: 'Visitante',
    guest_description:
      'A função "Visitante" partilha o mesmo modelo de organização em diferentes organizações.',
    create_more_roles:
      'Pode criar mais funções nas definições do modelo de organização. Essas funções de organização serão aplicadas a diferentes organizações.',
    read_resource: 'ler:recurso',
    edit_resource: 'editar:recurso',
    delete_resource: 'eliminar:recurso',
    ellipsis: '...',
    johnny:
      'Johny pertence a duas organizações com o email "john@email.com" como único identificador. Ele é administrador da organização A e convidado da organização B.',
    sarah:
      'Sarah pertence a uma organização com o email "sarah@email.com" como único identificador. Ela é administradora da organização B.',
    tony: 'Tony pertence a uma organização com o email "tony@email.com" como único identificador. Ele é membro da organização C.',
  },
};

export default Object.freeze(organizations);
