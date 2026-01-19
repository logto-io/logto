import password_rejected from './password-rejected.js';

const error = {
  general_required: `{{types, list(type: disjunction;)}} je povinné`,
  general_invalid: `{{types, list(type: disjunction;)}} je neplatné`,
  invalid_min_max_input: 'Hodnota musí být mezi {{minValue}} a {{maxValue}} znaky',
  invalid_min_max_length: 'Délka hodnoty musí být mezi {{minLength}} a {{maxLength}} znaky',
  username_required: 'Uživatelské jméno je povinné',
  password_required: 'Heslo je povinné',
  username_exists: 'Uživatelské jméno již existuje',
  username_should_not_start_with_number: 'Uživatelské jméno nesmí začínat číslem',
  username_invalid_charset: 'Uživatelské jméno může obsahovat pouze písmena, čísla a podtržítka',
  invalid_email: 'E-mailová adresa je neplatná',
  invalid_phone: 'Telefonní číslo je neplatné',
  passwords_do_not_match: 'Hesla se neshodují. Zkus to prosím znovu.',
  invalid_passcode: 'Ověřovací kód je neplatný.',
  invalid_connector_auth: 'Ověření je neplatné',
  invalid_connector_request: 'Zadané údaje jsou neplatné',
  unknown: 'Neznámá chyba. Zkus to prosím později.',
  invalid_session: 'Relace nebyla nalezena. Vrať se zpět a přihlas se znovu.',
  timeout: 'Vypršel časový limit požadavku. Zkus to prosím později.',
  password_rejected,
  sso_not_enabled: 'Single Sign-On není povolen pro tento e-mailový účet.',
  invalid_link: 'Neplatný odkaz',
  invalid_link_description: 'Tvůj jednorázový kód mohl vypršet nebo již není platný.',
  captcha_verification_failed: 'Ověření, že nejsi robot, se nezdařilo.',
  terms_acceptance_required: 'Je nutné souhlasit s podmínkami',
  terms_acceptance_required_description:
    'Pro pokračování je nutné souhlasit s podmínkami. Zkus to prosím znovu.',
  something_went_wrong: 'Něco se pokazilo.',
  feature_not_enabled: 'Tato funkce není povolena.',
};

export default Object.freeze(error);
