const single_sign_on = {
  forbidden_domains: 'I domini di posta elettronica pubblica non sono consentiti.',
  duplicated_domains: 'Ci sono domini duplicati.',
  invalid_domain_format: 'Formato del dominio non valido.',
  duplicate_connector_name:
    'Il nome del connettore esiste già. Si prega di scegliere un nome diverso.',
  idp_initiated_authentication_not_supported:
    "L'autenticazione avviata da IdP è supportata esclusivamente per i connettori SAML.",
  idp_initiated_authentication_invalid_application_type:
    'Tipo di applicazione non valido. Sono consentite solo applicazioni {{type}}.',
  idp_initiated_authentication_redirect_uri_not_registered:
    "Il redirect_uri non è registrato. Si prega di controllare le impostazioni dell'applicazione.",
  idp_initiated_authentication_client_callback_uri_not_found:
    "L'URI di callback dell'autenticazione iniziata dal client IdP non è stato trovato. Controlla le impostazioni del connettore.",
};

export default Object.freeze(single_sign_on);
