const user_identity_details = {
  social_identity_page_title: 'Detalles de identidad social',
  back_to_user_details: 'Volver a los detalles del usuario',
  delete_identity: `Eliminar conexión de identidad`,
  social_account: {
    title: 'Cuenta social',
    description:
      'Ver datos del usuario e información del perfil sincronizados desde la cuenta de {{connectorName}} vinculada.',
    provider_name: 'Nombre del proveedor de identidad social',
    identity_id: 'ID de identidad social',
    user_profile: 'Perfil de usuario sincronizado desde el proveedor de identidad social',
  },
  sso_account: {
    title: 'Cuenta SSO empresarial',
    description:
      'Ver datos del usuario e información del perfil sincronizados desde la cuenta de {{connectorName}} vinculada.',
    provider_name: 'Nombre del proveedor de identidad SSO empresarial',
    identity_id: 'ID de identidad SSO empresarial',
    user_profile: 'Perfil de usuario sincronizado desde el proveedor de identidad SSO empresarial',
  },
  token_storage: {
    title: 'Token de acceso',
    description:
      'Almacenar tokens de acceso y actualización de {{connectorName}} en el Secret Vault. Permite realizar llamadas API automatizadas sin el consentimiento repetido del usuario.',
  },
  access_token: {
    title: 'Token de acceso',
    description_active:
      'El token de acceso está activo y se almacena de manera segura en el Secret Vault. Tu producto puede usarlo para acceder a las API de {{connectorName}}.',
    description_inactive:
      'Este token de acceso está inactivo (por ejemplo, revocado). Los usuarios deben reautorizar el acceso para restaurar la funcionalidad.',
    description_expired:
      'Este token de acceso ha caducado. La renovación ocurre automáticamente en la próxima solicitud API usando el token de actualización. Si el token de actualización no está disponible, se requiere la reautenticación del usuario.',
  },
  refresh_token: {
    available:
      'El token de actualización está disponible. Si el token de acceso caduca, se actualizará automáticamente usando el token de actualización.',
    not_available:
      'El token de actualización no está disponible. Después de que el token de acceso caduque, los usuarios deben reautenticarse para obtener nuevos tokens.',
  },
  token_status: 'Estado del token',
  created_at: 'Creado el',
  updated_at: 'Actualizado el',
  expires_at: 'Caduca el',
  scopes: 'Ámbitos',
  delete_tokens: {
    title: 'Eliminar tokens',
    description:
      'Eliminar los tokens almacenados. Los usuarios deben reautorizar el acceso para restaurar la funcionalidad.',
    confirmation_message:
      '¿Estás seguro de que deseas eliminar los tokens? Logto Secret Vault eliminará los tokens de acceso y actualización de {{connectorName}} almacenados. Este usuario debe reautorizar para restaurar el acceso a la API de {{connectorName}}.',
  },
  token_storage_disabled: {
    title: 'El almacenamiento de tokens está desactivado para este conector',
    description:
      'Los usuarios actualmente solo pueden usar {{connectorName}} para iniciar sesión, vincular cuentas o sincronizar perfiles durante cada flujo de consentimiento. Para acceder a las API de {{connectorName}} y realizar acciones en nombre de los usuarios, habilita el almacenamiento de tokens en',
  },
};

export default Object.freeze(user_identity_details);
