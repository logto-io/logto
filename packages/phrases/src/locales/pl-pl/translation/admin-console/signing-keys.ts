const signing_keys = {
  title: 'Klucze podpisu',
  description: 'Bezpiecznie zarządzaj kluczami podpisów używanymi przez twoje aplikacje.',
  private_key: 'Prywatne klucze OIDC',
  private_keys_description: 'Prywatne klucze OIDC są używane do podpisywania tokenów JWT.',
  cookie_key: 'Klucze cookie OIDC',
  cookie_keys_description: 'Klucze cookie OIDC są używane do podpisywania plików cookie.',
  private_keys_in_use: 'Używane klucze prywatne',
  cookie_keys_in_use: 'Używane klucze ciasteczek',
  rotate_private_keys: 'Obróć klucze prywatne',
  rotate_cookie_keys: 'Obróć klucze ciasteczek',
  rotate_private_keys_description:
    'Ta akcja spowoduje utworzenie nowego klucza prywatnego do podpisywania, obrócenie bieżącego klucza i usunięcie poprzedniego klucza. Twoje tokeny JWT podpisane aktualnym kluczem pozostaną ważne do czasu usunięcia lub kolejnego obrotu.',
  rotate_cookie_keys_description:
    'Ta akcja spowoduje utworzenie nowego klucza ciasteczka, obrócenie bieżącego klucza i usunięcie poprzedniego klucza. Twoje ciasteczka z aktualnym kluczem pozostaną ważne do czasu usunięcia lub kolejnego obrotu.',
  select_private_key_algorithm: 'Wybierz algorytm podpisywania klucza dla nowego klucza prywatnego',
  rotate_button: 'Obróć',
  table_column: {
    id: 'ID',
    status: 'Status',
    algorithm: 'Algorytm podpisywania klucza',
  },
  status: {
    current: 'Bieżący',
    previous: 'Poprzedni',
  },
  reminder: {
    rotate_private_key:
      'Czy na pewno chcesz obrócić <strong>Klucze prywatne OIDC</strong>? Nowo wydane tokeny JWT będą podpisywane nowym kluczem. Istniejące tokeny JWT pozostają ważne do czasu ponownego obrotu.',
    rotate_cookie_key:
      'Czy na pewno chcesz obrócić <strong>Klucze ciasteczek OIDC</strong>? Nowo generowane ciasteczka w sesjach logowania będą podpisywane nowym kluczem ciasteczka. Istniejące ciasteczka pozostają ważne do czasu ponownego obrotu.',
    delete_private_key:
      'Czy na pewno chcesz usunąć <strong>Klucz prywatny OIDC</strong>? Istniejące tokeny JWT podpisane tym kluczem prywatnym przestaną być ważne.',
    delete_cookie_key:
      'Czy na pewno chcesz usunąć <strong>Klucz ciasteczka OIDC</strong>? Starsze sesje logowania z ciasteczkami podpisanymi tym kluczem ciasteczka przestaną być ważne. Wymagane będzie ponowne uwierzytelnienie tych użytkowników.',
  },
  messages: {
    rotate_key_success: 'Klucze podpisu obrócone pomyślnie.',
    delete_key_success: 'Klucz usunięty pomyślnie.',
  },
};

export default Object.freeze(signing_keys);
