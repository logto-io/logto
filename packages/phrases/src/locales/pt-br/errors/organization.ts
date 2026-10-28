const organization = {
  require_membership: 'O usuário deve ser um membro da organização para continuar.',
  role_names_not_found:
    '检测到无效的角色名称：{{names,list(type:conjunction)}}。请先创建这些角色然后再继续操作。',
  invitation_status_not_changeable: 'O status do convite não pode mais ser alterado.',
  accepted_user_id_required: 'O `acceptedUserId` é obrigatório ao aceitar um convite.',
  invitee_already_member: 'O convidado já é membro da organização.',
  accepted_user_email_mismatch: 'O usuário que aceita deve ter o mesmo e-mail do convidado.',
  expires_at_in_future: 'O valor de `expiresAt` deve estar no futuro.',
};

export default Object.freeze(organization);
