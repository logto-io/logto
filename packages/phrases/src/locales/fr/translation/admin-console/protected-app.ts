const protected_app = {
  name: 'Application Protégée',
  title:
    "Créez une application protégée : ajoutez l'authentification en toute simplicité et avec une vitesse épique",
  fast_create: 'Création rapide',
  modal_title: 'Créer une Application Protégée',
  modal_subtitle:
    "Activez une protection sécurisée et rapide en quelques clics. Ajoutez facilement l'authentification à votre application web existante.",
  form: {
    url_field_label: "Votre URL d'origine",
    url_field_placeholder: 'https://domaine.com/',
    url_field_description:
      "Indiquez l'adresse de votre application nécessitant une protection d'authentification.",
    url_field_modification_notice:
      "Les modifications apportées à l'URL d'origine peuvent prendre de 1 à 2 minutes pour être effectives dans les emplacements du réseau mondial.",
    url_field_tooltip:
      "Indiquez l'adresse de votre application, en excluant tout '/chemin'. Après la création, vous pouvez personnaliser les règles d'authentification de routage.\n\nRemarque : l'URL d'origine en elle-même ne nécessite pas d'authentification ; la protection est appliquée exclusivement aux accès via le domaine de l'application désignée.",
    domain_field_label: "Domaine de l'application",
    domain_field_placeholder: 'votre-domaine',
    domain_field_description:
      "Cette URL sert de proxy de protection d'authentification pour l'URL d'origine. Un domaine personnalisé peut être appliqué après la création.",
    domain_field_description_short:
      "Cette URL sert de proxy de protection d'authentification pour l'URL d'origine.",
    domain_field_tooltip:
      "Les applications protégées par Logto seront hébergées par défaut à 'votre-domaine.{{domain}}'. Un domaine personnalisé peut être appliqué après la création.",
    create_application: "Créer l'application",
    create_protected_app: 'Création rapide',
    errors: {
      domain_required: 'Votre domaine est requis.',
      domain_in_use: 'Ce nom de sous-domaine est déjà utilisé.',
      invalid_domain_format:
        "Format de sous-domaine invalide : utilisez uniquement des lettres minuscules, des chiffres et des tirets '-'.",
      url_required: "L'URL d'origine est requise.",
      invalid_url:
        "Format d'URL d'origine invalide : Utilisez http:// ou https://. Remarque : '/chemin' n'est actuellement pas pris en charge.",
      localhost:
        "Veuillez exposer votre serveur local à Internet d'abord. En savoir plus sur le <a>développement local</a>.",
    },
  },
  id_token_claims: {
    card_title: "Claims de l'ID token",
    card_description:
      "Demandez des scopes utilisateur supplémentaires lors de la connexion à l'application protégée pour inclure les claims étendus activés dans l'ID token transmis.",
    field_title: 'Scopes supplémentaires',
    field_description:
      "Les claims ne sont inclus que lorsqu'ils sont activés dans <a>Custom JWT > ID token</a> et que le scope correspondant est demandé ici.",
    table_column_scope: 'Scope',
    table_column_claims_forwarded: 'Claims transmis',
    disabled_claims_hint:
      "Les claims grisés ne sont pas encore transmis. Activez-les dans <a>Custom JWT > ID token</a> pour les inclure dans l'ID token.",
  },
  success_message:
    "🎉 Authentification de l'application activée avec succès ! Découvrez la nouvelle expérience de votre site web.",
};

export default Object.freeze(protected_app);
