const application = {
  invalid_type: 'Tylko aplikacje maszyna-do-maszyny mogą mieć przypisane role.',
  role_exists: 'Rola o identyfikatorze {{roleId}} została już dodana do tej aplikacji.',
  invalid_role_type: 'Nie można przypisać roli typu użytkownika do aplikacji maszyna-do-maszyny.',
  /** UNTRANSLATED */
  invalid_third_party_application_type:
    'Only traditional web applications can be marked as a third-party app.',
};

export default Object.freeze(application);
