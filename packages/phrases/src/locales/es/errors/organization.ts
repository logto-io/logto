const organization = {
  require_membership: 'El usuario debe ser miembro de la organización para continuar.',
  role_names_not_found:
    'Nombres de roles no válidos detectados: {{names,list(type:conjunction)}}. Por favor, crea estos roles primero antes de continuar.',
  invitation_status_not_changeable: 'El estado de la invitación ya no se puede cambiar.',
  accepted_user_id_required: 'Se requiere `acceptedUserId` al aceptar una invitación.',
  invitee_already_member: 'El invitado ya es miembro de la organización.',
  accepted_user_email_mismatch:
    'El usuario que acepta debe tener el mismo correo electrónico que el invitado.',
  expires_at_in_future: 'El valor de `expiresAt` debe estar en el futuro.',
};

export default Object.freeze(organization);
