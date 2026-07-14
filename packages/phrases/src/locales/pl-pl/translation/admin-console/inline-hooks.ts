const inline_hooks = {
  page_title: 'Hooki inline',
  title: 'Hooki inline',
  subtitle:
    'Uruchamiaj niestandardowy kod w określonych punktach procesu uwierzytelniania, aby rozszerzyć działanie Logto.',
  status: {
    not_configured: 'Nieskonfigurowany',
    configured: 'Skonfigurowany',
    enabled: 'Włączony',
    disabled: 'Wyłączony',
  },
  hooks: {
    post_first_factor_verification: {
      name: 'Po weryfikacji pierwszego czynnika',
      description:
        'Uruchom niestandardową logikę po zweryfikowaniu pierwszego czynnika uwierzytelniania i przed kontynuowaniem logowania.',
    },
    post_sign_in: {
      name: 'Po zalogowaniu',
      description: 'Uruchom niestandardową logikę po pomyślnym zalogowaniu się użytkownika.',
    },
  },
};

export default Object.freeze(inline_hooks);
