const role = {
  name_in_use: 'Ta nazwa roli {{name}} jest już w użyciu',
  scope_exists: 'Identyfikator zakresu {{scopeId}} został już dodany do tej roli',
  user_exists: 'Identyfikator użytkownika {{userId}} został już dodany do tej roli',
  default_role_missing:
    'Niektóre z domyślnych nazw ról nie istnieją w bazie danych, upewnij się, że najpierw utworzysz role',
  internal_role_violation:
    'Możesz próbować zaktualizować lub usunąć rolę wewnętrzną, co jest zabronione przez Logto. Jeśli tworzysz nową rolę, spróbuj innej nazwy, która nie zaczyna się od "#internal:".',
};

export default role;
