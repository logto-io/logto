const enterprise_sso = {
  page_title: "SSO d'entreprise",
  title: "SSO d'entreprise",
  subtitle:
    "Connectez le fournisseur d'identité de l'entreprise et activez la connexion unique initiée par le fournisseur de services.",
  create: "Ajouter un connecteur d'entreprise",
  col_connector_name: 'Nom du connecteur',
  col_type: 'Type',
  col_email_domain: 'Domaine de messagerie',
  col_status: 'Statut',
  col_status_in_use: 'Utilisé',
  col_status_invalid: 'Invalide',
  placeholder_title: "Connecteur d'entreprise",
  placeholder_description:
    "Logto a fourni de nombreux fournisseurs d'identité d'entreprise intégrés à connecter. Vous pouvez également créer le vôtre avec des protocoles standard.",
  create_modal: {
    title: "Ajouter un connecteur d'entreprise",
    text_divider: 'Ou vous pouvez personnaliser votre connecteur avec un protocole standard.',
    connector_name_field_title: 'Nom du connecteur',
    connector_name_field_placeholder: "Nom du fournisseur d'identité de l'entreprise",
    create_button_text: 'Créer un connecteur',
  },
  guide: {
    subtitle: "Un guide pas à pas pour connecter le fournisseur d'identité d'entreprise.",
    finish_button_text: 'Continuer',
  },
  basic_info: {
    title: 'Configurez votre service dans IdP',
    description:
      "Créez une nouvelle intégration d'application par SAML 2.0 dans votre fournisseur d'identité {{name}}. Ensuite, collez la valeur suivante dessus.",
    saml: {
      acs_url_field_name: "URL du service de consommation d'assertions (URL de réponse)",
      audience_uri_field_name: "URI de l'auditoire (ID de l'entité SP)",
    },
    oidc: {
      redirect_uri_field_name: 'URI de redirection (URL de rappel)',
    },
  },
  attribute_mapping: {
    title: "Correspondance d'attributs",
    description:
      "`id` et `email` sont nécessaires pour synchroniser le profil de l'utilisateur à partir de l'IdP. Entrez le nom de revendication et la valeur suivants dans votre IdP.",
    col_sp_claims: 'Nom de revendication de Logto',
    col_idp_claims: "Nom de revendication du fournisseur d'identité",
    idp_claim_tooltip: "Le nom de revendication du fournisseur d'identité",
  },
  metadata: {
    title: 'Configurez les métadonnées IdP',
    description: "Configurez les métadonnées du fournisseur d'identité",
    dropdown_trigger_text: 'Utiliser une autre méthode de configuration',
    dropdown_title: 'sélectionnez votre méthode de configuration',
    metadata_format_url: "Entrez l'URL des métadonnées",
    metadata_format_xml: 'Téléchargez le fichier XML de métadonnées',
    metadata_format_manual: 'Entrez manuellement les détails des métadonnées',
    saml: {
      metadata_url_field_name: 'URL des métadonnées',
      metadata_url_description:
        "Récupérez dynamiquement les données à partir de l'URL des métadonnées et maintenez le certificat à jour.",
      metadata_xml_field_name: 'Fichier XML de métadonnées',
      metadata_xml_uploader_text: 'Téléchargez le fichier XML de métadonnées',
      sign_in_endpoint_field_name: 'URL de connexion',
      idp_entity_id_field_name: "ID de l'entité IdP (Émetteur)",
      certificate_field_name: 'Certificat de signature',
      certificate_placeholder: 'Copiez et collez le certificat x509',
    },
    oidc: {
      client_id_field_name: 'ID client',
      client_secret_field_name: 'Secret client',
      issuer_field_name: 'Émetteur',
      scope_field_name: 'Portée',
    },
  },
};

export default Object.freeze(enterprise_sso);
