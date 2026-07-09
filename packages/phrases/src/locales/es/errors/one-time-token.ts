const one_time_token = {
  token_not_found: 'Token {{token}} no encontrado.',
  email_mismatch: 'El correo electrónico no coincide con el token proporcionado.',
  interaction_event_mismatch: 'El token no se puede usar para esta interacción.',
  token_expired: 'El token ha expirado.',
  token_consumed: 'El token ha sido consumido.',
  token_revoked: 'El token ha sido revocado.',
  cannot_reactivate_token: 'No se puede reactivar el token.',
};

export default Object.freeze(one_time_token);
