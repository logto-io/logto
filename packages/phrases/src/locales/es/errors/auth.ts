const auth = {
  authorization_header_missing: 'Falta encabezado de autorización.',
  authorization_token_type_not_supported: 'Tipo de autorización no admitido.',
  unauthorized: 'No autorizado. Por favor, revise las credenciales y su alcance.',
  forbidden: 'Prohibido. Por favor, revise sus roles y permisos de usuario.',
  expected_role_not_found:
    'Rol esperado no encontrado. Por favor, revise sus roles y permisos de usuario.',
  jwt_sub_missing: 'Falta `sub` en JWT.',
  require_re_authentication:
    'Se requiere una nueva autenticación para realizar una acción protegida.',
  exceed_token_limit: 'Límite de token excedido. Por favor, contacta a tu administrador.',
  third_party_application_forbidden:
    'Las aplicaciones de terceros no pueden modificar los datos de la cuenta a través de esta API.',
};

export default Object.freeze(auth);
