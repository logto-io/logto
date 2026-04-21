const oss_onboarding = {
  page_title: 'Incorporación',
  title: 'Cuéntanos un poco sobre ti',
  description:
    'Cuéntanos un poco sobre ti y tu proyecto. Esto nos ayuda a crear un Logto mejor para todos.',
  email: {
    label: 'Correo electrónico',
    description: 'Usaremos esta dirección si necesitamos contactarte sobre tu cuenta.',
    placeholder: 'email@example.com',
  },
  newsletter:
    'Recibe actualizaciones del producto, avisos de seguridad y contenido seleccionado de Logto.',
  project: {
    label: 'Uso Logto para',
    personal: 'Proyecto personal',
    company: 'Proyecto de empresa',
  },
  company_name: {
    label: 'Nombre de la empresa',
    placeholder: 'Acme.co',
  },
  company_size: {
    label: '¿Cuál es el tamaño de tu empresa?',
  },
  errors: {
    email_required: 'El correo electrónico es obligatorio',
    email_invalid: 'Introduce un correo electrónico válido',
  },
};

export default Object.freeze(oss_onboarding);
