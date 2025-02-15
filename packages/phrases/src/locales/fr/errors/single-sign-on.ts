const single_sign_on = {
  forbidden_domains: 'Les domaines de messagerie publique ne sont pas autorisés.',
  duplicated_domains: 'Il existe des domaines en double.',
  invalid_domain_format: 'Format de domaine invalide.',
  duplicate_connector_name: 'Le nom du connecteur existe déjà. Veuillez choisir un nom différent.',
  idp_initiated_authentication_not_supported:
    "L'authentification initiée par l'IdP est exclusivement prise en charge pour les connecteurs SAML.",
  idp_initiated_authentication_invalid_application_type:
    "Type d'application invalide. Seules les applications {{type}} sont autorisées.",
  idp_initiated_authentication_redirect_uri_not_registered:
    "L'URI de redirection n'est pas enregistrée. Veuillez vérifier les paramètres de l'application.",
  idp_initiated_authentication_client_callback_uri_not_found:
    "L'URI de rappel d'authentification initiée par le client IdP n'est pas trouvée. Veuillez vérifier les paramètres du connecteur.",
};

export default Object.freeze(single_sign_on);
