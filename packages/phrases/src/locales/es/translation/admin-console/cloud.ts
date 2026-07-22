const cloud = {
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
