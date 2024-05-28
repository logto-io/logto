const user = {
  username_already_in_use: 'Este nombre de usuario ya está en uso.',
  email_already_in_use: 'Este correo electrónico está asociado a una cuenta existente.',
  phone_already_in_use: 'Este número de teléfono está asociado a una cuenta existente.',
  invalid_email: 'Dirección de correo electrónico inválida.',
  invalid_phone: 'Número de teléfono inválido.',
  email_not_exist: 'La dirección de correo electrónico no ha sido registrada aún.',
  phone_not_exist: 'El número de teléfono no ha sido registrado aún.',
  identity_not_exist: 'La cuenta social no ha sido registrada aún.',
  identity_already_in_use: 'La cuenta social ha sido asociada a una cuenta existente.',
  social_account_exists_in_profile: 'Ya has asociado esta cuenta social.',
  cannot_delete_self: 'No puedes eliminarte a ti mismo.',
  sign_up_method_not_enabled: 'Este método de registro no está habilitado.',
  sign_in_method_not_enabled: 'Este método de inicio de sesión no está habilitado.',
  same_password: 'La nueva contraseña no puede ser igual a la anterior.',
  password_required_in_profile: 'Debes establecer una contraseña antes de iniciar sesión.',
  new_password_required_in_profile: 'Debes establecer una nueva contraseña.',
  password_exists_in_profile: 'La contraseña ya existe en tu perfil.',
  username_required_in_profile: 'Debes establecer un nombre de usuario antes de iniciar sesión.',
  username_exists_in_profile: 'El nombre de usuario ya existe en tu perfil.',
  email_required_in_profile:
    'Debes agregar una dirección de correo electrónico antes de iniciar sesión.',
  email_exists_in_profile: 'Tu perfil ya está asociado a una dirección de correo electrónico.',
  phone_required_in_profile: 'Debes agregar un número de teléfono antes de iniciar sesión.',
  phone_exists_in_profile: 'Tu perfil ya está asociado a un número de teléfono.',
  email_or_phone_required_in_profile:
    'Debes agregar una dirección de correo electrónico o un número de teléfono antes de iniciar sesión.',
  suspended: 'Esta cuenta ha sido suspendida.',
  user_not_exist: 'No existe un usuario con {{ identifier }}.',
  missing_profile: 'Debes proporcionar información adicional antes de iniciar sesión.',
  role_exists: 'El id de rol {{roleId}} ya ha sido agregado a este usuario',
  invalid_role_type:
    'Tipo de rol no válido, no se puede asignar un rol de máquina a máquina a un usuario.',
  missing_mfa: 'Debes vincular un MFA adicional antes de iniciar sesión.',
  totp_already_in_use: 'TOTP ya está en uso.',
  backup_code_already_in_use: 'El código de respaldo ya está en uso.',
  password_algorithm_required: 'Se requiere algoritmo de contraseña.',
  password_and_digest:
    'No puedes establecer una contraseña en texto plano y en formato resumido al mismo tiempo.',
};

export default Object.freeze(user);
