const application = {
  invalid_type: 'Только приложения типа "от машины к машине" могут иметь связанные роли.',
  role_exists: 'Роль с идентификатором {{roleId}} уже добавлена в это приложение.',
  invalid_role_type:
    'Невозможно назначить роль типа "пользователь" для приложения типа "от машины к машине".',
};

export default Object.freeze(application);
