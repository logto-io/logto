const cloud = {
  general: {
    onboarding: 'Вводный курс',
  },
  create_tenant: {
    page_title: 'Создать арендатора',
    title: 'Создайте вашего первого арендатора',
    description:
      'Арендатор – это изолированная среда, где вы можете управлять пользовательскими идентификаторами, приложениями и всеми другими ресурсами Logto.',
    invite_collaborators: 'Пригласите ваших сотрудников по электронной почте',
  },
  social_callback: {
    title: 'Вход выполнен успешно',
    description:
      'Вы успешно вошли, используя свою учетную запись в социальной сети. Чтобы обеспечить безпроблемную интеграцию и доступ ко всем функциям Logto, рекомендуем настроить свой собственный социальный коннектор.',
    /** UNTRANSLATED */
    notice:
      "Please avoid using the demo connector for production purposes. Once you've completed testing, kindly delete the demo connector and set up your own connector with your credentials.",
  },
  tenant: {
    create_tenant: 'Создать арендатора',
  },
};

export default Object.freeze(cloud);
