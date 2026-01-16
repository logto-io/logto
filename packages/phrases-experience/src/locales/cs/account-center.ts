const account_center = {
  header: {
    title: 'Centrum účtu',
  },
  home: {
    title: 'Stránka nenalezena',
    description: 'Tato stránka není k dispozici.',
  },
  verification: {
    title: 'Ověření bezpečnosti',
    description:
      "Ověř, že jsi to ty, pro ochranu svého účtu. Prosím vyber metodu ověření identity.",
    error_send_failed: 'Odeslání ověřovacího kódu se nezdařilo. Zkus to prosím později.',
    error_invalid_code: 'Ověřovací kód je neplatný nebo vypršel.',
    error_verify_failed: 'Ověření se nezdařilo. Zadej kód znovu.',
    verification_required: 'Ověření vypršelo. Prosím ověř svou identitu znovu.',
    try_another_method: 'Vyzkoušej jinou metodu ověření',
  },
  password_verification: {
    title: 'Ověřit heslo',
    description: "Ověř, že jsi to ty, pro ochranu svého účtu. Zadej své heslo.",
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
    verification_description:
      'Ověřovací kód byl odeslán na tvůj e-mail {{email_address}}.',
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
    success: 'Uživatelské jméno bylo úspěšně aktualizováno.',
  },
  password: {
    title: 'Nastavit heslo',
    description: 'Vytvoř nové heslo pro zabezpečení svého účtu.',
    success: 'Heslo bylo úspěšně změněno.',
  },

  code_verification: {
    send: 'Odeslat ověřovací kód',
    resend: 'Stále jsi ho neobdržel/a? <a>Odeslat kód znovu</a>',
    resend_countdown: 'Stále jsi ho neobdržel/a?<span> Odeslat znovu za {{seconds}}s.</span>',
  },

  email_verification: {
    title: 'Ověřit e-mailovou adresu',
    prepare_description:
      "Ověř, že jsi to ty, pro ochranu svého účtu. Odeslat ověřovací kód na tvůj e-mail.",
    email_label: 'E-mailová adresa',
    send: 'Odeslat ověřovací kód',
    description:
      'Ověřovací kód byl odeslán na tvůj e-mail {{email}}. Zadej kód pro pokračování.',
    resend: 'Stále jsi ho neobdržel/a? <a>Odeslat kód znovu</a>',
    resend_countdown: 'Stále jsi ho neobdržel/a?<span> Odeslat znovu za {{seconds}}s.</span>',
    error_send_failed: 'Odeslání ověřovacího kódu se nezdařilo. Zkus to prosím později.',
    error_verify_failed: 'Ověření se nezdařilo. Prosím, zadej kód znovu.',
    error_invalid_code: 'Ověřovací kód je neplatný nebo vypršel.',
  },
  phone_verification: {
    title: 'Ověřit telefonní číslo',
    prepare_description:
      "Ověř, že jsi to ty, pro ochranu svého účtu. Odeslat ověřovací kód na tvé telefonní číslo.",
    phone_label: 'Telefonní číslo',
    send: 'Odeslat ověřovací kód',
    description:
      'Ověřovací kód byl odeslán na tvé telefonní číslo {{phone}}. Zadej kód pro pokračování.',
    resend: 'Stále jsi ho neobdržel/a? <a>Odeslat kód znovu</a>',
    resend_countdown: 'Stále jsi ho neobdržel/a?<span> deslat znovu za {{seconds}}s.</span>',
    error_send_failed: 'Odeslání ověřovacího kódu se nezdařilo. Zkus to prosím později.',
    error_verify_failed: 'Ověření se nezdařilo. Prosím, zadej kód znovu.',
    error_invalid_code: 'Ověřovací kód je neplatný nebo vypršel.',
  },
  mfa: {
    totp_already_added:
      'Autentizační aplikace je již přidána. Prosím, nejprve odstraň stávající.',
    totp_not_enabled:
      'Autentizační aplikace není povolena. Kontaktuj prosím administrátora pro její aktivaci.',
    backup_code_already_added:
      'Máš již aktivní záložní kódy. Použij je nebo je odstraň před generováním nových.',
    backup_code_not_enabled:
      'Záložní kód není povolen. Kontaktuj prosím administrátora pro jeho aktivaci.',
    backup_code_requires_other_mfa: 'Záložní kódy vyžadují nejprve nastavení jiné metody dvoufázového ověření.',
    passkey_not_enabled: 'Ověřovací klíč není povolen. Kontaktuj prosím administrátora pro jeho aktivaci.',
  },
  update_success: {
    default: {
      title: 'Aktualizace úspěšná',
      description: 'Změny byly úspěšně uloženy.',
    },
    email: {
      title: 'E-mailová adresa aktualizována!',
      description: "E-mailová adresa tvého účtu byla úspěšně změněna.",
    },
    phone: {
      title: 'Telefonní číslo aktualizováno!',
      description: "Telefonní číslo tvého účtu bylo úspěšně změněno.",
    },
    username: {
      title: 'Uživatelské jméno aktualizováno!',
      description: "Uživatelské jméno tvého účtu bylo úspěšně změněno.",
    },
    password: {
      title: 'Heslo aktualizováno!',
      description: "Heslo tvého účtu bylo úspěšně změněno.",
    },
    totp: {
      title: 'Autentizační aplikace přidána',
      description: 'Tvá autentizační aplikace byla úspěšně propojena s účtem.',
    },
    backup_code: {
      title: 'Záložní kódy vygenerovány!',
      description: 'Tvůj záložní kód byl uložen. Uchovej jej na bezpečném místě.',
    },
    backup_code_deleted: {
      title: 'Záložní kódy odstraněny!',
      description: 'Záložní kódy byly odstraněny z tvého účtu.',
    },
    passkey: {
      title: 'Ověřovací klíč přidán!',
      description: 'Tvůj ověřovací klíč byl úspěšně propojen s účtem.',
    },
    passkey_deleted: {
      title: 'Ověřovací klíč odstraněn!',
      description: 'Tvůj ověřovací klíč byl odstraněn z účtu.',
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
    delete_confirmation_title: 'Odstranit záložní kódy',
    delete_confirmation_description:
      'Pokud tyto záložní kódy odstraníš, nebudeš je moci používat pro ověření.',
  },
  passkey: {
    title: 'Ověřovací klíče',
    added: 'Přidáno: {{date}}',
    last_used: 'Naposledy použito: {{date}}',
    never_used: 'Nikdy',
    unnamed: 'Nepojmenovaný ověřovací klíč',
    renamed: 'Ověřovací klíč byl úspěšně přejmenován.',
    add_another_title: 'Přidat další ověřovací klíč',
    add_another_description:
      'Zaregistruj svůj ověřovací klíč pomocí biometrie zařízení, bezpečnostních klíčů (např. YubiKey) nebo jiných dostupných metod.',
    add_passkey: 'Přidat ověřovací klíč',
    delete_confirmation_title: 'Odstranit ověřovací klíč',
    delete_confirmation_description:
      'Opravdu chceš odstranit "{{name}}"? Tento ověřovací klíč již nebude možné použít pro přihlášení.',
    rename_passkey: 'Přejmenovat ověřovací klíč',
    rename_description: 'Zadej nové jméno pro tento ověřovací klíč.',
  },
};

export default Object.freeze(account_center);
