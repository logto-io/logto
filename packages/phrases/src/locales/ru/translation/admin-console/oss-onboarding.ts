const oss_onboarding = {
  page_title: 'Онбординг',
  title: 'Расскажите немного о себе',
  description:
    'Расскажите немного о себе и своем проекте. Это помогает нам делать Logto лучше для всех.',
  email: {
    label: 'Электронная почта',
    description:
      'Мы будем использовать этот адрес, если понадобится связаться с вами по поводу аккаунта.',
    placeholder: 'email@example.com',
  },
  newsletter:
    'Получать обновления продукта, уведомления о безопасности и подборку материалов от Logto.',
  project: {
    label: 'Я использую Logto для',
    personal: 'Личного проекта',
    company: 'Проекта компании',
  },
  project_name: {
    label: 'Название проекта',
    placeholder: 'Мой проект',
  },
  company_name: {
    label: 'Название компании',
    placeholder: 'Acme.co',
  },
  company_size: {
    label: 'Каков размер вашей компании?',
  },
  errors: {
    email_required: 'Электронная почта обязательна',
    email_invalid: 'Введите корректный адрес электронной почты',
    project_name_too_long: 'Название проекта должно содержать не более 200 символов',
  },
};

export default Object.freeze(oss_onboarding);
