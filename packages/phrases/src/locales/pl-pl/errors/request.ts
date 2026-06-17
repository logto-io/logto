const request = {
  invalid_input: 'Nieprawidłowe dane wejściowe. {{details}}',
  general: 'Wystąpił błąd żądania.',
  range_not_satisfiable: 'Zakres nie do zrealizowania.',
  feature_not_supported: 'Ta funkcja nie jest obsługiwana w bieżącym środowisku.',
  rate_limited: 'Zbyt wiele żądań. Spróbuj ponownie później.',
};

export default Object.freeze(request);
