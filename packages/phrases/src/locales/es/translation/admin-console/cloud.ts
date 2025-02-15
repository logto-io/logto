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
  },
  social_callback: {
    title: 'Ha iniciado sesión correctamente',
    description:
      'Ha iniciado sesión correctamente utilizando su cuenta social. Para garantizar una integración perfecta y el acceso a todas las funciones de Logto, recomendamos que proceda a configurar su propio conector social.',
    /** UNTRANSLATED */
    notice:
      "Please avoid using the demo connector for production purposes. Once you've completed testing, kindly delete the demo connector and set up your own connector with your credentials.",
  },
  tenant: {
    create_tenant: 'Crear inquilino',
  },
};

export default Object.freeze(cloud);
