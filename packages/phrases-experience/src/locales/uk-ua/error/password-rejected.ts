const password_rejected = {
  too_short: 'Мінімальна довжина – {{min}} символів.',
  too_long: 'Максимальна довжина – {{max}} символів.',
  character_types: 'Необхідно щонайменше {{min}} типи символів.',
  unsupported_characters: 'Знайдено непідтримуваний символ.',
  pwned: 'Уникайте простих паролів, які легко вгадати.',
  restricted_found: 'Уникайте надмірного використання {{list, list}}.',
  restricted: {
    repetition: 'повторюваних символів',
    sequence: 'послідовних символів',
    user_info: 'ваших персональних даних',
    words: 'контексту продукту',
  },
};

export default Object.freeze(password_rejected);
