const verification_record = {
  not_found: 'No se encontró el registro de verificación.',
  permission_denied: 'Permiso denegado, por favor vuelve a autenticarte.',
  not_supported_for_google_one_tap: 'Esta API no es compatible con Google One Tap.',
  social_verification: {
    invalid_target:
      'Registro de verificación no válido. Se esperaba {{expected}} pero se obtuvo {{actual}}.',
    token_response_not_found:
      'No se encontró la respuesta del token. Por favor, verifica que el almacenamiento de tokens sea compatible y esté habilitado para el conector social.',
  },
};

export default Object.freeze(verification_record);
