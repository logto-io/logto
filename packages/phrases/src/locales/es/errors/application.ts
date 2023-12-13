const application = {
  invalid_type: 'Solo las aplicaciones de máquina a máquina pueden tener roles asociados.',
  role_exists: 'La identificación del rol {{roleId}} ya se ha agregado a esta aplicación.',
  invalid_role_type:
    'No se puede asignar un rol de tipo usuario a una aplicación de máquina a máquina.',
  /** UNTRANSLATED */
  invalid_third_party_application_type:
    'Only traditional web applications can be marked as a third-party app.',
};

export default Object.freeze(application);
