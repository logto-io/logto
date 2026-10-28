const organization = {
  require_membership: 'Użytkownik musi być członkiem organizacji, aby kontynuować.',
  role_names_not_found:
    '检测到无效的角色名称：{{names,list(type:conjunction)}}。请先创建这些角色，然后再继续。',
  invitation_status_not_changeable: 'Status zaproszenia nie może być już zmieniony.',
  accepted_user_id_required: '`acceptedUserId` jest wymagane podczas akceptowania zaproszenia.',
  invitee_already_member: 'Zaproszony użytkownik jest już członkiem organizacji.',
  accepted_user_email_mismatch:
    'Akceptujący użytkownik musi mieć ten sam adres e-mail co zaproszony.',
  expires_at_in_future: 'Wartość `expiresAt` musi być w przyszłości.',
};

export default Object.freeze(organization);
