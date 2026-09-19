const organization = {
  require_membership: 'Пользователь должен быть участником организации, чтобы продолжить.',
  role_names_not_found:
    'Обнаружены недопустимые имена ролей: {{names,list(type:conjunction)}}. Пожалуйста, сначала создайте эти роли, прежде чем продолжить.',
  invitation_status_not_changeable: 'Статус приглашения больше не может быть изменен.',
  accepted_user_id_required: '`acceptedUserId` обязателен при принятии приглашения.',
  invitee_already_member: 'Приглашенный уже является участником организации.',
  accepted_user_email_mismatch:
    'Принимающий пользователь должен иметь тот же адрес электронной почты, что и приглашенный.',
  expires_at_in_future: 'Значение `expiresAt` должно быть в будущем.',
};

export default Object.freeze(organization);
