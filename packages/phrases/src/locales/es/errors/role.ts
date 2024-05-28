const role = {
  name_in_use: 'Este nombre de rol {{name}} ya está en uso',
  scope_exists: 'El id de alcance {{scopeId}} ya ha sido agregado a este rol',
  management_api_scopes_not_assignable_to_user_role:
    'No se pueden asignar alcances de API de gestión a un rol de usuario.',
  user_exists: 'El id de usuario {{userId}} ya ha sido agregado a este rol',
  application_exists: 'El id de aplicación {{applicationId}} ya ha sido agregado a este rol',
  default_role_missing:
    'Algunos de los nombres de roles predeterminados no existen en la base de datos, por favor asegúrese de crear los roles primero',
  internal_role_violation:
    'Tal vez esté intentando actualizar o eliminar un rol interno lo cual es prohibido por Logto. Si está creando un nuevo rol, intente con otro nombre que no empiece con "#internal:".',
};

export default Object.freeze(role);
