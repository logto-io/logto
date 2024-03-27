const signing_keys = {
  title: 'Claves de firma',
  description: 'Administre de forma segura las claves de firma utilizadas por sus aplicaciones.',
  private_key: 'Claves privadas OIDC',
  private_keys_description: 'Las claves privadas OIDC se utilizan para firmar tokens JWT.',
  cookie_key: 'Claves de cookies OIDC',
  cookie_keys_description: 'Las claves de cookies OIDC se utilizan para firmar cookies.',
  private_keys_in_use: 'Claves privadas en uso',
  cookie_keys_in_use: 'Claves de cookies en uso',
  rotate_private_keys: 'Rotar claves privadas',
  rotate_cookie_keys: 'Rotar claves de cookies',
  rotate_private_keys_description:
    'Esta acción creará una nueva clave de firma privada, rotará la clave actual y eliminará su clave anterior. Sus tokens JWT firmados con la clave actual seguirán siendo válidos hasta su eliminación o otra rotación.',
  rotate_cookie_keys_description:
    'Esta acción creará una nueva clave de cookie, rotará la clave actual y eliminará su clave anterior. Sus cookies con la clave actual seguirán siendo válidos hasta su eliminación o otra rotación.',
  select_private_key_algorithm: 'Seleccione el algoritmo de firma de la nueva clave privada',
  rotate_button: 'Rotar',
  table_column: {
    id: 'ID',
    status: 'Estado',
    algorithm: 'Algoritmo de clave de firma',
  },
  status: {
    current: 'Actual',
    previous: 'Anterior',
  },
  reminder: {
    rotate_private_key:
      '¿Estás seguro de que deseas rotar las <strong>claves privadas OIDC</strong>? Los nuevos tokens JWT emitidos serán firmados por la nueva clave. Los tokens JWT existentes seguirán siendo válidos hasta que los vuelvas a rotar.',
    rotate_cookie_key:
      '¿Estás seguro de que deseas rotar las <strong>claves de cookies OIDC</strong>? Las nuevas cookies generadas en sesiones de inicio de sesión serán firmadas por la nueva clave de cookie. Las cookies existentes seguirán siendo válidas hasta que las vuelvas a rotar.',
    delete_private_key:
      '¿Estás seguro de que deseas eliminar la <strong>clave privada OIDC</strong>? Los tokens JWT existentes firmados con esta clave de firma privada ya no serán válidos.',
    delete_cookie_key:
      '¿Estás seguro de que deseas eliminar la <strong>clave de cookies OIDC</strong>? Las sesiones de inicio de sesión antiguas con cookies firmadas con esta clave de cookie ya no serán válidas. Se requiere una reautenticación para estos usuarios.',
  },
  messages: {
    rotate_key_success: 'Claves de firma rotadas con éxito.',
    delete_key_success: 'Clave eliminada con éxito.',
  },
};

export default Object.freeze(signing_keys);
