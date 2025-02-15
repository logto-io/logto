const cloud = {
  general: {
    onboarding: 'Wdrażanie',
  },
  create_tenant: {
    page_title: 'Utwórz najemcę',
    title: 'Utwórz swojego pierwszego najemcę',
    description:
      'Najemca to odizolowane środowisko, w którym możesz zarządzać tożsamościami użytkowników, aplikacjami i wszystkimi innymi zasobami Logto.',
    invite_collaborators: 'Zaproś swoich współpracowników za pomocą e-maila',
  },
  social_callback: {
    title: 'Zalogowałeś się pomyślnie',
    description:
      'Zalogowałeś się pomyślnie używając swojego konta społecznościowego. Aby zapewnić bezproblemową integrację i dostęp do wszystkich funkcji Logto, zalecamy przejście do konfiguracji własnego konektora społecznościowego.',
    /** UNTRANSLATED */
    notice:
      "Please avoid using the demo connector for production purposes. Once you've completed testing, kindly delete the demo connector and set up your own connector with your credentials.",
  },
  tenant: {
    create_tenant: 'Stwórz najemcę',
  },
};

export default Object.freeze(cloud);
