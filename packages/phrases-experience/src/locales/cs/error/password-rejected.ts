const password_rejected = {
  too_short: 'Minimální délka je {{min}} znaků.',
  too_long: 'Maximální délka je {{max}} znaků.',
  character_types: 'Je vyžadováno alespoň {{min}} typů znaků.',
  unsupported_characters: 'Byl nalezen nepodporovaný znak.',
  pwned: 'Vyhni se jednoduchým heslům, která jsou snadno uhodnutelná.',
  restricted_found: 'Nepoužívej příliš často {{list, list}}.',
  restricted: {
    repetition: 'opakující se znaky',
    sequence: 'pořadové znaky',
    user_info: 'tvé osobní údaje',
    words: 'slova z kontextu produktu',
  },
};

export default Object.freeze(password_rejected);
