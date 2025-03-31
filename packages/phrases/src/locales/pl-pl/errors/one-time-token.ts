const one_time_token = {
  token_not_found: 'Nie znaleziono aktywnego tokenu pasującego do podanego adresu e-mail i tokenu.',
  email_mismatch: 'Adres e-mail nie pasuje do podanego tokenu.',
  token_expired: 'Token wygasł.',
  token_consumed: 'Token został użyty.',
  token_revoked: 'Token został unieważniony.',
  cannot_reactivate_token: 'Nie można ponownie aktywować tego tokenu.',
};

export default Object.freeze(one_time_token);
