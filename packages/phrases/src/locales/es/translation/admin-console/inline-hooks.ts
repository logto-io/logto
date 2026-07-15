const inline_hooks = {
  page_title: 'Hooks inline',
  title: 'Hooks inline',
  subtitle:
    'Ejecuta código personalizado en puntos específicos del flujo de autenticación para ampliar el comportamiento de Logto.',
  status: {
    not_configured: 'Sin configurar',
    configured: 'Configurado',
    enabled: 'Habilitado',
    disabled: 'Deshabilitado',
  },
  hooks: {
    post_first_factor_verification: {
      name: 'Después de verificar el primer factor',
      description:
        'Ejecuta lógica personalizada después de verificar el primer factor de autenticación y antes de continuar con el inicio de sesión.',
    },
    post_sign_in: {
      name: 'Después de iniciar sesión',
      description:
        'Ejecuta lógica personalizada después de que un usuario inicie sesión correctamente.',
    },
  },
};

export default Object.freeze(inline_hooks);
