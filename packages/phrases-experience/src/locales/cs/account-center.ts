const account_center = {
  home: {
    title: 'Stránka nenalezena',
    description: 'Tato stránka není k dispozici.',
  },
  page: {
    title: 'Účet',
    security_title: 'Zabezpečení',
    security_description: 'Zde můžeš změnit nastavení svého účtu a zajistit tak jeho bezpečnost.',
    /** UNTRANSLATED */
    profile_title: 'Personal info',
    /** UNTRANSLATED */
    profile_description: 'Change your personal information here.',
    /** UNTRANSLATED */
    sidebar_personal_info: 'Personal info',
    /** UNTRANSLATED */
    sidebar_security: 'Security',
    support: 'Podpora',
  },
  verification: {
    title: 'Ověření bezpečnosti',
    description:
      'Ověř, že jsi to ty, pro ochranu svého účtu. Prosím vyber metodu ověření identity.',
    error_send_failed: 'Odeslání ověřovacího kódu se nezdařilo. Zkus to prosím později.',
    error_invalid_code: 'Ověřovací kód je neplatný nebo vypršel.',
    error_verify_failed: 'Ověření se nezdařilo. Zadej kód znovu.',
    verification_required: 'Ověření vypršelo. Prosím ověř svou identitu znovu.',
    try_another_method: 'Vyzkoušej jinou metodu ověření',
    no_available_methods_title: 'Nejsou k dispozici žádné metody ověření',
    no_available_methods_description:
      'Nemáš nastavenou žádnou metodu ověření. Nejprve si ke svému účtu přidej heslo, e-mail nebo telefonní číslo.',
  },
  password_verification: {
    title: 'Ověřit heslo',
    description: 'Ověř, že jsi to ty, pro ochranu svého účtu. Zadej své heslo.',
    error_failed: 'Ověření se nezdařilo. Zkontroluj prosím své heslo.',
  },
  verification_method: {
    password: {
      name: 'Heslo',
      description: 'Ověř své heslo',
    },
    email: {
      name: 'E-mailový ověřovací kód',
      description: 'Odeslat ověřovací kód na tvůj e-mail',
    },
    phone: {
      name: 'SMS ověřovací kód',
      description: 'Odeslat ověřovací kód na tvé telefonní číslo',
    },
  },
  email: {
    title: 'Propojit e-mail',
    description: 'Propoj svůj e-mail pro přihlášení nebo obnovení účtu.',
    verification_title: 'Zadej ověřovací kód z e-mailu',
    verification_description: 'Ověřovací kód byl odeslán na tvůj e-mail {{email_address}}.',
    success: 'Primární e-mail byl úspěšně propojen.',
    verification_required: 'Ověření vypršelo. Prosím ověř svou identitu znovu.',
  },
  phone: {
    title: 'Propojit telefonní číslo',
    description: 'Propoj své telefonní číslo pro přihlášení nebo obnovení účtu.',
    verification_title: 'Zadej SMS ověřovací kód',
    verification_description: 'Ověřovací kód byl odeslán na tvé telefonní číslo {{phone_number}}.',
    success: 'Primární telefonní číslo bylo úspěšně propojeno.',
    verification_required: 'Ověření vypršelo. Prosím ověř svou identitu znovu.',
  },
  username: {
    title: 'Nastavit uživatelské jméno',
    description: 'Uživatelské jméno může obsahovat pouze písmena, čísla a podtržítka.',
    success: 'Uživatelské jméno bylo úspěšně změněno.',
  },
  security: {
    add: 'Přidat',
    change: 'Změnit',
    remove: 'Odstranit',
    not_set: 'Nenastaveno',
    social_sign_in: 'Přihlášení přes sociální účet',
    social_not_linked: 'Nepropojeno',
    email_phone: 'E-mail / Telefon',
    email: 'E-mail',
    phone: 'Telefonní číslo',
    password: 'Heslo',
    configured: 'Nastaveno',
    not_configured: 'Nenastaveno',
    two_step_verification: 'Dvoufázové ověření',
    authenticator_app: 'Autentizační aplikace',
    passkeys: 'Přístupové klíče',
    backup_codes: 'Záložní kódy',
    email_verification_code: 'Ověřovací kód z e-mailu',
    phone_verification_code: 'Ověřovací kód z telefonu',
    passkeys_count_one: '{{count}} přístupový klíč',
    passkeys_count_other: '{{count}} přístupové klíče',
    backup_codes_count_one: 'zbývá {{count}} kód',
    backup_codes_count_other: 'zbývá {{count}} kódů',
    view: 'Zobrazit',
    manage: 'Spravovat',
    turn_on_2_step_verification: 'Zapnout dvoufázové ověření',
    turn_on_2_step_verification_description:
      'Přidejte další vrstvu zabezpečení. Při přihlášení budete vyzváni k druhému ověřovacímu kroku.',
    two_step_verification_description:
      'Přidejte další vrstvu zabezpečení. Při přihlášení budete vyzváni k druhému ověřovacímu kroku.',
    turn_off_2_step_verification: 'Vypnout dvoufázové ověření',
    turn_off_2_step_verification_description:
      'Vypnutí dvoufázového ověření odstraní další vrstvu ochrany vašeho účtu při přihlášení. Opravdu chcete pokračovat?',
    disable_2_step_verification: 'Vypnout',
    no_verification_method_warning:
      'Nepřidali jste druhou ověřovací metodu. Přidejte alespoň jednu pro povolení dvoufázového ověření při přihlášení.',
    account_removal: 'Smazání účtu',
    delete_your_account: 'Smazat svůj účet',
    delete_account: 'Smazat účet',
    remove_email_confirmation_title: 'Odstranit e-mailovou adresu',
    remove_email_confirmation_description:
      'Po odstranění se již nebudete moci přihlásit pomocí této e-mailové adresy. Opravdu chcete pokračovat?',
    remove_phone_confirmation_title: 'Odstranit telefonní číslo',
    remove_phone_confirmation_description:
      'Po odstranění se již nebudete moci přihlásit pomocí tohoto telefonního čísla. Opravdu chcete pokračovat?',
    email_removed: 'E-mailová adresa byla úspěšně odstraněna.',
    phone_removed: 'Telefonní číslo bylo úspěšně odstraněno.',
  },
  social: {
    linked: '{{connector}} byl úspěšně propojen.',
    removed: '{{connector}} byl úspěšně odstraněn.',
    not_enabled:
      'Tato metoda přihlášení přes sociální účet není povolena. Požádej prosím o pomoc svého administrátora.',
    remove_confirmation_title: 'Odstranit sociální účet',
    remove_confirmation_description:
      'Pokud odstraníš {{connector}}, nebude možné se s ním přihlásit, dokud ho znovu nepropojíš.',
  },
  password: {
    title: 'Nastavit heslo',
    description: 'Vytvoř nové heslo pro zabezpečení svého účtu.',
    success: 'Heslo bylo úspěšně změněno.',
  },
  code_verification: {
    send: 'Odeslat ověřovací kód',
    resend: 'Stále jsi ho neobdržel/a? <a>Odeslat kód znovu</a>',
    resend_countdown: 'Stále jsi ho neobdržel/a? Odeslat znovu za {{seconds}}s.',
  },
  email_verification: {
    title: 'Ověřit e-mailovou adresu',
    prepare_description:
      'Ověř, že jsi to ty, pro ochranu svého účtu. Odeslat ověřovací kód na tvůj e-mail.',
    email_label: 'E-mailová adresa',
    send: 'Odeslat ověřovací kód',
    description: 'Ověřovací kód byl odeslán na tvůj e-mail {{email}}. Zadej kód pro pokračování.',
    resend: 'Stále jsi ho neobdržel/a? <a>Odeslat kód znovu</a>',
    not_received: 'Stále jsi ho neobdržel/a?',
    resend_action: 'Odeslat ověřovací kód znovu',
    resend_countdown: 'Stále jsi ho neobdržel/a? Odeslat znovu za {{seconds}}s.',
    error_send_failed: 'Odeslání ověřovacího kódu se nezdařilo. Zkus to prosím později.',
    error_verify_failed: 'Ověření se nezdařilo. Prosím, zadej kód znovu.',
    error_invalid_code: 'Ověřovací kód je neplatný nebo vypršel.',
  },
  phone_verification: {
    title: 'Ověřit telefonní číslo',
    prepare_description:
      'Ověř, že jsi to ty, pro ochranu svého účtu. Odeslat ověřovací kód na tvé telefonní číslo.',
    phone_label: 'Telefonní číslo',
    send: 'Odeslat ověřovací kód',
    description:
      'Ověřovací kód byl odeslán na tvé telefonní číslo {{phone}}. Zadej kód pro pokračování.',
    resend: 'Stále jsi ho neobdržel/a? <a>Odeslat kód znovu</a>',
    resend_countdown: 'Stále jsi ho neobdržel/a? Odeslat znovu za {{seconds}}s.',
    error_send_failed: 'Odeslání ověřovacího kódu se nezdařilo. Zkus to prosím později.',
    error_verify_failed: 'Ověření se nezdařilo. Prosím, zadej kód znovu.',
    error_invalid_code: 'Ověřovací kód je neplatný nebo vypršel.',
  },
  mfa: {
    totp_already_added: 'Autentizační aplikace je již přidána. Prosím, nejprve odstraň stávající.',
    totp_not_enabled:
      'Autentizační aplikace není povolena. Kontaktuj prosím administrátora pro její aktivaci.',
    backup_code_already_added:
      'Máš již aktivní záložní kódy. Použij je nebo je odstraň před generováním nových.',
    backup_code_not_enabled:
      'Záložní kód není povolen. Kontaktuj prosím administrátora pro jeho aktivaci.',
    backup_code_requires_other_mfa:
      'Záložní kódy vyžadují nejprve nastavení jiné metody dvoufázového ověření.',
    passkey_not_enabled:
      'Přístupový klíč není povolen. Kontaktuj prosím administrátora pro jeho aktivaci.',
    passkey_already_registered:
      'Tento přístupový klíč je již zaregistrován na tvém účtu. Použij prosím jiný přístupový klíč.',
  },
  update_success: {
    default: {
      title: 'Aktualizace úspěšná',
      description: 'Změny byly úspěšně uloženy.',
    },
    email: {
      title: 'E-mailová adresa aktualizována!',
      description: 'E-mailová adresa tvého účtu byla úspěšně změněna.',
    },
    phone: {
      title: 'Telefonní číslo aktualizováno!',
      description: 'Telefonní číslo tvého účtu bylo úspěšně změněno.',
    },
    username: {
      title: 'Uživatelské jméno aktualizováno!',
      description: 'Uživatelské jméno tvého účtu bylo úspěšně změněno.',
    },
    password: {
      title: 'Heslo aktualizováno!',
      description: 'Heslo tvého účtu bylo úspěšně změněno.',
    },
    totp: {
      title: 'Autentizační aplikace přidána!',
      description: 'Tvá autentizační aplikace byla úspěšně propojena s účtem.',
    },
    totp_replaced: {
      title: 'Autentizační aplikace nahrazena!',
      description: 'Tvá autentizační aplikace byla úspěšně nahrazena.',
    },
    backup_code: {
      title: 'Záložní kódy vygenerovány!',
      description: 'Tvoje záložní kódy byly uloženy. Uchovej je na bezpečném místě.',
    },
    passkey: {
      title: 'Přístupový klíč přidán!',
      description: 'Tvůj přístupový klíč byl úspěšně propojen s účtem.',
    },
    social: {
      title: 'Sociální účet propojen!',
      description: 'Tvůj sociální účet byl úspěšně propojen.',
    },
  },
  backup_code: {
    title: 'Záložní kódy',
    description:
      'Můžeš použít jeden z těchto záložních kódů pro přístup k účtu, pokud narazíš na problém během dvoufázového ověření. Každý kód lze použít pouze jednou.',
    copy_hint: 'Nezapomeň je zkopírovat a uložit na bezpečné místo.',
    generate_new_title: 'Vygenerovat nové záložní kódy',
    generate_new: 'Vygenerovat nové záložní kódy',
  },
  passkey: {
    title: 'Přístupové klíče',
    added: 'Přidáno: {{date}}',
    last_used: 'Naposledy použito: {{date}}',
    never_used: 'Nikdy',
    unnamed: 'Nepojmenovaný přístupový klíč',
    renamed: 'Přístupový klíč byl úspěšně přejmenován.',
    deleted: 'Přístupový klíč byl úspěšně odstraněn.',
    add_another_title: 'Přidat další přístupový klíč',
    add_another_description:
      'Zaregistruj svůj přístupový klíč pomocí biometrie zařízení, bezpečnostních klíčů (např. YubiKey) nebo jiných dostupných metod.',
    add_passkey: 'Přidat přístupový klíč',
    delete_confirmation_title: 'Odstranit přístupový klíč',
    delete_confirmation_description:
      'Pokud tento přístupový klíč odstraníš, nebude možné ho již použít pro ověření.',
    rename_passkey: 'Přejmenovat přístupový klíč',
    rename_description: 'Zadej nové jméno pro tento přístupový klíč.',
    name_this_passkey: 'Pojmenovat tento přístupový klíč',
    name_passkey_description:
      'Úspěšně jsi ověřil/a toto zařízení pro dvoufázové ověření. Přizpůsob název, abys mohl/a rozpoznat více klíčů.',
    name_input_label: 'Název',
  },
};

export default Object.freeze(account_center);
