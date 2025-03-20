const one_time_token = {
  token_not_found:
    'No se encontró un token activo con el correo electrónico y token proporcionados.',
  email_mismatch: 'El correo electrónico no coincide con el token proporcionado.',
  token_expired: 'El token ha expirado.',
  token_consumed: 'El token ha sido consumido.',
  token_revoked: 'El token ha sido revocado.',
  cannot_reactivate_token: 'No se puede reactivar el token.',
};

export default Object.freeze(one_time_token);
