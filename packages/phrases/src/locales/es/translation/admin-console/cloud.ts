const cloud = {
  console_sso: {
    back_to_list: 'Volver a SSO de la consola',
    create: 'Añadir conector',
    title: 'SSO de la consola',
    description:
      'Configura tu propio proveedor de identidad para acceder a Logto Console mediante el inicio de sesión único.',
    domain_bound: 'Vinculado',
    domain_pending: 'Verificando',
    domain_verify_step: 'Verifica tu dominio',
    domain_bind_step: 'Vincular dominio de correo electrónico',
    domain_add_placeholder: 'Añadir un dominio de correo',
    domain_bound_description:
      'Este dominio está activo para Console SSO. Se ha eliminado su registro TXT de verificación.',
    domain_dns_instructions:
      'Añade este registro TXT en tu proveedor de DNS para verificar la propiedad del dominio.',
    domain_waiting_for_dns: 'Esperando el registro TXT. Volveremos a comprobarlo cada 10 segundos.',
    domain_proven_unbound:
      'Se verificó la propiedad del dominio, pero no se completó la vinculación.',
    domain_verified: 'Se verificó la propiedad del dominio.',
    domain_binding_pending: 'La vinculación comienza automáticamente después de la verificación.',
    domain_remove_description:
      '¿Quitar {{domain}} de Console SSO? Al quitar un dominio vinculado, sus direcciones de correo dejarán de encontrarse mediante SSO.',
    domain_invalid: 'Introduce un dominio de correo válido.',
    domain_conflict: 'Este dominio ya está vinculado a otro conector de Console SSO.',
    domain_invalid_provider:
      'Completa la configuración de conexión antes de vincular este dominio.',
    domain_dns_timeout: 'La comprobación de DNS falló. Lo intentaremos de nuevo automáticamente.',
    domain_recovery: 'El cambio de dominio está incompleto.',
    start_over: 'Empezar de nuevo',
    start_over_confirmation:
      'Empezar de nuevo puede eliminar tu configuración de SSO incompleta. ¿Quieres continuar?',
    resume_creation:
      'Se encontró una creación sin finalizar. Continúa con el mismo proveedor para recuperar este conector.',
  },
  general: {
    onboarding: 'Integración',
  },
  create_tenant: {
    page_title: 'Crear inquilino',
    title: 'Crea tu primer inquilino',
    description:
      'Un inquilino es un entorno aislado donde puedes gestionar identidades de usuarios, aplicaciones y todos los demás recursos de Logto.',
    invite_collaborators: 'Invita a tus colaboradores por correo electrónico',
    hear_about_us: {
      title: '¿Cómo conociste Logto por primera vez?',
      detail_placeholder: 'Cuéntanos más (opcional)',
      options: {
        search_engine: 'Motor de búsqueda (Google, Bing...)',
        ai_assistant: 'Asistente de IA (ChatGPT, Claude, Gemini...)',
        github_oss: 'GitHub o directorios de código abierto',
        friend_colleague: 'Un amigo o colega',
        powered_by: 'Página de inicio de sesión de una aplicación que usa Logto',
        content_social: 'Redes sociales, artículo o video (YouTube, X, Reddit...)',
        other: 'Otro',
      },
    },
  },
  social_callback: {
    title: 'Ha iniciado sesión correctamente',
    description:
      'Ha iniciado sesión correctamente utilizando su cuenta social. Para garantizar una integración perfecta y el acceso a todas las funciones de Logto, recomendamos que proceda a configurar su propio conector social.',
    notice:
      'Evita usar el conector de demostración para fines de producción. Una vez que hayas completado las pruebas, elimina amablemente el conector de demostración y configura tu propio conector con tus credenciales.',
  },
  tenant: {
    create_tenant: 'Crear inquilino',
  },
};

export default Object.freeze(cloud);
