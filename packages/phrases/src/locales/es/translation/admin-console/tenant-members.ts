const tenant_members = {
  members: 'Miembros',
  invitations: 'Invitaciones',
  invite_members: 'Invitar miembros',
  user: 'Usuario',
  roles: 'Roles',
  admin: 'Administrador',
  collaborator: 'Colaborador',
  invitation_status: 'Estado de la invitación',
  inviter: 'Invitador',
  expiration_date: 'Fecha de vencimiento',
  invite_modal: {
    title: 'Invitar personas a Silverhand',
    subtitle: 'Para invitar miembros a una organización, deben aceptar la invitación.',
    to: 'Para',
    added_as: 'Añadido como roles',
    email_input_placeholder: 'johndoe@example.com',
  },
  invitation_statuses: {
    pending: 'Pendiente',
    accepted: 'Aceptada',
    expired: 'Caducada',
    revoked: 'Revocada',
  },
  invitation_empty_placeholder: {
    title: 'Invitar miembros al equipo',
    description:
      'Tu inquilino actualmente no tiene miembros invitados.\nPara ayudar con tu integración, considera agregar más miembros o administradores.',
  },
  menu_options: {
    edit: 'Editar rol del inquilino',
    delete: 'Eliminar usuario del inquilino',
    resend_invite: 'Reenviar invitación',
    revoke: 'Revocar invitación',
    delete_invitation_record: 'Eliminar este registro de invitación',
  },
  edit_modal: {
    title: 'Cambiar roles de {{name}}',
  },
  delete_user_confirm: '¿Estás seguro de que quieres eliminar a este usuario de este inquilino?',
  assign_admin_confirm:
    '¿Estás seguro de que deseas hacer que el/los usuario(s) seleccionado(s) sea(n) administrador(es)? Otorgar acceso de administrador dará al usuario/los usuarios los siguientes permisos.<ul><li>Cambiar el plan de facturación del inquilino</li><li>Agregar o eliminar colaboradores</li><li>Eliminar el inquilino</li></ul>',
  revoke_invitation_confirm: '¿Estás seguro de que quieres revocar esta invitación?',
  delete_invitation_confirm: '¿Estás seguro de que quieres eliminar este registro de invitación?',
  messages: {
    invitation_sent: 'Invitación enviada.',
    invitation_revoked: 'Invitación revocada.',
    invitation_resend: 'Invitación reenviada.',
    invitation_deleted: 'Registro de invitación eliminado.',
  },
  errors: {
    email_required: 'El correo electrónico del invitado es obligatorio.',
    email_exists: 'La dirección de correo electrónico ya existe.',
    member_exists: 'Este usuario ya es miembro de esta organización.',
    pending_invitation_exists:
      'Existe una invitación pendiente. Elimina el correo electrónico relacionado o revoca la invitación.',
    invalid_email:
      'La dirección de correo electrónico es inválida. Asegúrate de que esté en el formato correcto.',
    max_member_limit: 'Has alcanzado el número máximo de miembros ({{limit}}) para este inquilino.',
  },
};

export default Object.freeze(tenant_members);
