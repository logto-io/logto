const tenants = {
  title: 'Paramètres',
  description: 'Gérez efficacement les paramètres du locataire et personnalisez votre domaine.',
  tabs: {
    settings: 'Paramètres',
    domains: 'Domaines',
    subscription: 'Plan et facturation',
    billing_history: 'Historique de facturation',
  },
  settings: {
    title: 'PARAMÈTRES',
    tenant_id: 'ID du locataire',
    tenant_name: 'Nom du locataire',
    environment_tag: "Tag de l'environnement",
    environment_tag_description:
      'Les balises ne modifient pas le service. Elles servent simplement à différencier différents environnements.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: 'Les informations du locataire ont été enregistrées avec succès.',
  },
  deletion_card: {
    title: 'SUPPRIMER',
    tenant_deletion: 'Supprimer le locataire',
    tenant_deletion_description:
      'La suppression du locataire entraînera la suppression permanente de toutes les données utilisateur et configurations associées. Veuillez procéder avec prudence.',
    tenant_deletion_button: 'Supprimer le locataire',
  },
  create_modal: {
    title: 'Créer un locataire',
    subtitle: 'Créez un nouveau locataire pour séparer les ressources et les utilisateurs.',
    create_button: 'Créer un locataire',
    tenant_name_placeholder: 'Mon locataire',
  },
  delete_modal: {
    title: 'Supprimer le locataire',
    description_line1:
      'Voulez-vous vraiment supprimer votre locataire "<span>{{name}}</span>" avec le tag de suffixe d\'environnement "<span>{{tag}}</span>" ? Cette action est irréversible et entraînera la suppression permanente de toutes vos données et informations de compte.',
    description_line2:
      'Avant de supprimer le compte, peut-être pouvons-nous vous aider. <span><a>Contactez-nous par e-mail</a></span>',
    description_line3:
      'Si vous souhaitez continuer, veuillez entrer le nom du locataire "<span>{{name}}</span>" pour confirmer.',
    delete_button: 'Supprimer définitivement',
    cannot_delete_title: 'Impossible de supprimer ce locataire',
    cannot_delete_description:
      "Désolé, vous ne pouvez pas supprimer ce locataire pour le moment. Assurez-vous d'être sur le Plan Gratuit et d'avoir payé toutes les factures en cours.",
  },
  tenant_landing_page: {
    title: "Vous n'avez pas encore créé de locataire",
    description:
      "Pour commencer à configurer votre projet avec Logto, veuillez créer un nouveau locataire. Si vous devez vous déconnecter ou supprimer votre compte, cliquez simplement sur le bouton d'avatar dans le coin supérieur droit.",
    create_tenant_button: 'Créer un locataire',
  },
  status: {
    mau_exceeded: 'MAU dépassé',
    suspended: 'Suspendu',
    overdue: 'En retard',
  },
  tenant_suspended_page: {
    title: 'Tenant suspended. Contact us to restore access.',
    description_1:
      'We deeply regret to inform you that your tenant account has been temporarily suspended due to improper use, including exceeding MAU limits, overdue payments, or other unauthorized actions.',
    description_2:
      'If you require further clarification, have any concerns, or wish to restore full functionality and unblock your tenants, please do not hesitate to contact us immediately.',
  },
  signing_keys: {
    /** UNTRANSLATED */
    title: 'SIGNING KEYS',
    /** UNTRANSLATED */
    description: 'Securely manage signing keys in your tenant.',
    type: {
      /** UNTRANSLATED */
      private_key: 'OIDC private keys',
      /** UNTRANSLATED */
      cookie_key: 'OIDC cookie keys',
    },
    /** UNTRANSLATED */
    private_keys_in_use: 'Private keys in use',
    /** UNTRANSLATED */
    cookie_keys_in_use: 'Cookie keys in use',
    /** UNTRANSLATED */
    rotate_private_keys: 'Rotate private keys',
    /** UNTRANSLATED */
    rotate_cookie_keys: 'Rotate cookie keys',
    /** UNTRANSLATED */
    rotate_private_keys_description:
      'This action will create a new private signing key, rotate the current key, and remove your previous key. Your JWT tokens signed with the current key will remain valid until deletion or another round of rotation.',
    /** UNTRANSLATED */
    rotate_cookie_keys_description:
      'This action will create a new cookie key, rotate the current key, and remove your previous key. Your cookies with the current key will remain valid until deletion or another round of rotation.',
    /** UNTRANSLATED */
    select_private_key_algorithm: 'Select signing key algorithm for the new private key',
    /** UNTRANSLATED */
    rotate_button: 'Rotate',
    table_column: {
      /** UNTRANSLATED */
      id: 'ID',
      /** UNTRANSLATED */
      status: 'Status',
      /** UNTRANSLATED */
      algorithm: 'Signing key algorithm',
    },
    status: {
      /** UNTRANSLATED */
      current: 'Current',
      /** UNTRANSLATED */
      previous: 'Previous',
    },
    reminder: {
      /** UNTRANSLATED */
      rotate_private_key:
        'Are you sure you want to rotate the <strong>OIDC private keys</strong>? New issued JWT tokens will be signed by the new key. Existing JWT tokens stay valid until you rotate again.',
      /** UNTRANSLATED */
      rotate_cookie_key:
        'Are you sure you want to rotate the <strong>OIDC cookie keys</strong>? New cookies generated in sign-in sessions will be signed by the new cookie key. Existing cookies stay valid until you rotate again.',
      /** UNTRANSLATED */
      delete_private_key:
        'Are you sure you want to delete the <strong>OIDC private key</strong>? Existing JWT tokens signed with this private signing key will no longer be valid.',
      /** UNTRANSLATED */
      delete_cookie_key:
        'Are you sure you want to delete the <strong>OIDC cookie key</strong>? Older sign-in sessions with cookies signed with this cookie key will no longer be valid. A re-authentication is required for these users.',
    },
    messages: {
      /** UNTRANSLATED */
      rotate_key_success: 'Signing keys rotated successfully.',
      /** UNTRANSLATED */
      delete_key_success: 'Key deleted successfully.',
    },
  },
};

export default Object.freeze(tenants);
