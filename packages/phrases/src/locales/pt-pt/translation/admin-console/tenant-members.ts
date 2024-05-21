const tenant_members = {
  members: 'Membros',
  invitations: 'Convites',
  invite_members: 'Convidar membros',
  user: 'Utilizador',
  roles: 'Funções',
  admin: 'Administrador',
  collaborator: 'Colaborador',
  invitation_status: 'Estado do convite',
  inviter: 'Convidante',
  expiration_date: 'Data de expiração',
  invite_modal: {
    title: 'Convidar pessoas para Silverhand',
    subtitle: 'Para convidar membros para uma organização, eles devem aceitar o convite.',
    to: 'Para',
    added_as: 'Adicionado como funções',
    email_input_placeholder: 'johndoe@example.com',
  },
  invitation_statuses: {
    pending: 'Pendente',
    accepted: 'Aceite',
    expired: 'Expirado',
    revoked: 'Revogado',
  },
  invitation_empty_placeholder: {
    title: 'Convidar membros da equipa',
    description:
      'Neste momento, o seu espaço inquilino não tem membros convidados.\nPara ajudar na integração, considere adicionar mais membros ou administradores.',
  },
  menu_options: {
    edit: 'Editar função do inquilino',
    delete: 'Remover utilizador do inquilino',
    resend_invite: 'Reenviar convite',
    revoke: 'Revogar convite',
    delete_invitation_record: 'Eliminar este registo de convite',
  },
  edit_modal: {
    title: 'Alterar funções de {{name}}',
  },
  delete_user_confirm: 'Tem a certeza de que deseja remover este utilizador deste inquilino?',
  assign_admin_confirm:
    'Tem a certeza de que deseja tornar o(s) utilizador(es) selecionado(s) administrador(es)? Ao conceder acesso de administrador, o(s) utilizador(es) terão as seguintes permissões.<ul><li>Alterar o plano de faturação do inquilino</li><li>Adicionar ou remover colaboradores</li><li>Eliminar o inquilino</li></ul>',
  revoke_invitation_confirm: 'Tem a certeza de que deseja revogar este convite?',
  delete_invitation_confirm: 'Tem a certeza de que deseja eliminar este registo de convite?',
  messages: {
    invitation_sent: 'Convite enviado.',
    invitation_revoked: 'Convite revogado.',
    invitation_resend: 'Convite reenviado.',
    invitation_deleted: 'Registo de convite eliminado.',
  },
  errors: {
    email_required: 'O email do convidado é obrigatório.',
    email_exists: 'O endereço de email já existe.',
    member_exists: 'Este utilizador já é membro desta organização.',
    pending_invitation_exists:
      'Convite pendente existente. Elimine o email relacionado ou revogue o convite.',
    invalid_email: 'Endereço de email é inválido. Certifique-se de que está no formato correto.',
    max_member_limit: 'Atingiu o número máximo de membros ({{limit}}) para este inquilino.',
  },
};

export default Object.freeze(tenant_members);
