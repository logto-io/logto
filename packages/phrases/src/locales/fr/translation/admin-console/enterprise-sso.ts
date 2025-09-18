const enterprise_sso = {
  page_title: "SSO d'entreprise",
  title: "SSO d'entreprise",
  subtitle:
    "Connectez le fournisseur d'identité d'entreprise et activez l'authentification unique.",
  create: "Ajouter un connecteur d'entreprise",
  col_connector_name: 'Nom du connecteur',
  col_type: 'Type',
  col_email_domain: 'Domaine de messagerie',
  placeholder_title: "Connecteur d'entreprise",
  placeholder_description:
    "Logto a fourni de nombreux fournisseurs d'identités d'entreprise intégrés pour une connexion, pendant ce temps, vous pouvez créer le vôtre avec les protocoles SAML et OIDC.",
  create_modal: {
    title: "Ajouter un connecteur d'entreprise",
    text_divider: 'Ou vous pouvez personnaliser votre connecteur avec un protocole standard.',
    connector_name_field_title: 'Nom du connecteur',
    connector_name_field_placeholder: "Par exemple, {corp. name} - {nom du fournisseur d'identité}",
    create_button_text: 'Créer un connecteur',
  },
  guide: {
    subtitle: "Un guide pas à pas pour connecter le fournisseur d'identité de l'entreprise.",
    finish_button_text: 'Continuer',
  },
  basic_info: {
    title: "Configurez votre service dans l'IdP",
    description:
      "Créez une nouvelle intégration d'application par SAML 2.0 dans votre fournisseur d'identité {{name}}. Ensuite, collez la valeur suivante.",
    saml: {
      acs_url_field_name: "URL de service de consommation d'assertions (URL de réponse)",
      audience_uri_field_name: "URI de l'audience (ID d'entité du fournisseur de services)",
      entity_id_field_name: "ID d'entité du fournisseur de services (SP)",
      entity_id_field_tooltip:
        "L'ID d'entité SP peut être dans n'importe quel format de chaîne, généralement en utilisant une forme URI ou une forme URL comme identifiant, mais ce n'est pas obligatoire.",
      acs_url_field_placeholder: 'https://your-domain.com/api/saml/callback',
      entity_id_field_placeholder: 'urn:your-domain.com:sp:saml:{serviceProviderId}',
    },
    oidc: {
      redirect_uri_field_name: 'URI de redirection (URL de rappel)',
      redirect_uri_field_description:
        "L'URI de redirection est l'endroit où les utilisateurs sont redirigés après l'authentification SSO. Ajoutez cette URI à la configuration de votre IdP.",
      redirect_uri_field_custom_domain_description:
        'Si vous utilisez plusieurs <a>domaines personnalisés</a> dans Logto, veillez à ajouter toutes les URI de rappel correspondantes à votre IdP afin que le SSO fonctionne sur chaque domaine.\n\nLe domaine Logto par défaut (*.logto.app) est toujours valide ; incluez-le uniquement si vous souhaitez aussi prendre en charge le SSO sous ce domaine.',
    },
  },
  attribute_mapping: {
    title: 'Mappage des attributs',
    description:
      "`id` et `email` sont nécessaires pour synchroniser le profil de l'utilisateur à partir de l'IdP. Entrez le nom et la valeur du champ suivant dans votre IdP.",
    col_sp_claims: 'Valeur du fournisseur de services (Logto)',
    col_idp_claims: "Nom de réclamation du fournisseur d'identité",
    idp_claim_tooltip: "Le nom de réclamation du fournisseur d'identité",
  },
  metadata: {
    title: "Configurer les métadonnées de l'IdP",
    description: "Configurez les métadonnées du fournisseur d'identité",
    dropdown_trigger_text: 'Utiliser un autre méthode de configuration',
    dropdown_title: 'sélectionnez votre méthode de configuration',
    metadata_format_url: "Entrez l'URL des métadonnées",
    metadata_format_xml: 'Téléverser le fichier XML des métadonnées',
    metadata_format_manual: 'Saisir manuellement les détails des métadonnées',
    saml: {
      metadata_url_field_name: 'URL des métadonnées',
      metadata_url_description:
        "Récupérez dynamiquement les données à partir de l'URL des métadonnées et gardez le certificat à jour.",
      metadata_xml_field_name: 'Fichier XML des métadonnées IdP',
      metadata_xml_uploader_text: 'Téléverser le fichier XML des métadonnées',
      sign_in_endpoint_field_name: 'URL de connexion',
      idp_entity_id_field_name: "ID de l'entité IdP (Émetteur)",
      certificate_field_name: 'Certificat de signature',
      certificate_placeholder: 'Copiez et collez le certificat x509',
      certificate_required: 'Le certificat de signature est requis.',
    },
    oidc: {
      client_id_field_name: 'ID client',
      client_secret_field_name: 'Secret client',
      issuer_field_name: 'Émetteur',
      scope_field_name: 'Portée',
      scope_field_placeholder: 'Entrez les portées (séparées par un espace)',
    },
  },
};

export default Object.freeze(enterprise_sso);
