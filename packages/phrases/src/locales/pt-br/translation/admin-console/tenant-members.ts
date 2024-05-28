const tenant_members = {
  members: 'Membros',
  invitations: 'Convites',
  invite_members: 'Convidar membros',
  user: 'Usuário',
  roles: 'Funções',
  admin: 'Administrador',
  collaborator: 'Colaborador',
  invitation_status: 'Status do convite',
  inviter: 'Convidador',
  expiration_date: 'Data de expiração',
  invite_modal: {
    title: 'Convidar pessoas para Silverhand',
    subtitle: 'Para convidar membros para uma organização, eles devem aceitar o convite.',
    to: 'Para',
    added_as: 'Adicionados como funções',
    email_input_placeholder: 'johndoe@example.com',
  },
  invitation_statuses: {
    pending: 'Pendente',
    accepted: 'Aceito',
    expired: 'Expirado',
    revoked: 'Revogado',
  },
  invitation_empty_placeholder: {
    title: 'Convidar membros da equipe',
    description:
      'Seu locatário atualmente não possui membros convidados.\nPara ajudar com sua integração, considere adicionar mais membros ou administradores.',
  },
  menu_options: {
    edit: 'Editar função do locatário',
    delete: 'Remover usuário do locatário',
    resend_invite: 'Reenviar convite',
    revoke: 'Revogar convite',
    delete_invitation_record: 'Excluir este registro de convite',
  },
  edit_modal: {
    title: 'Alterar funções de {{name}}',
  },
  delete_user_confirm: 'Tem certeza de que deseja remover este usuário deste locatário?',
  assign_admin_confirm:
    'Tem certeza de que deseja tornar o(s) usuário(s) selecionado(s) como administrador? Conceder acesso de administrador dará ao(s) usuário(s) as seguintes permissões.<ul><li>Alterar o plano de cobrança do locatário</li><li>Adicionar ou remover colaboradores</li><li>Excluir o locatário</li></ul>',
  revoke_invitation_confirm: 'Tem certeza de que deseja revogar este convite?',
  delete_invitation_confirm: 'Tem certeza de que deseja excluir este registro de convite?',
  messages: {
    invitation_sent: 'Convite enviado.',
    invitation_revoked: 'Convite revogado.',
    invitation_resend: 'Convite reenviado.',
    invitation_deleted: 'Registro de convite excluído.',
  },
  errors: {
    email_required: 'O e-mail do convidado é obrigatório.',
    email_exists: 'O endereço de e-mail já existe.',
    member_exists: 'Este usuário já é membro desta organização.',
    pending_invitation_exists:
      'Convite pendente existe. Exclua o e-mail relacionado ou revogue o convite.',
    invalid_email: 'O endereço de e-mail é inválido. Certifique-se de que está no formato correto.',
    max_member_limit: 'Você atingiu o número máximo de membros ({{limit}}) para este locatário.',
  },
};

export default Object.freeze(tenant_members);
