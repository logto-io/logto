const organization_details = {
  page_title: "Détails de l'organisation",
  delete_confirmation:
    'Une fois supprimée, tous les membres perdront leur adhésion et leurs rôles dans cette organisation. Cette action ne peut pas être annulée.',
  organization_id: "Identifiant de l'organisation",
  settings_description:
    'Les organisations représentent les équipes, les clients professionnels et les entreprises partenaires qui peuvent accéder à vos applications.',
  name_placeholder: "Le nom de l'organisation, pas nécessairement unique.",
  description_placeholder: "Une description de l'organisation.",
  member: 'Membre',
  member_other: 'Membres',
  add_members_to_organization: "Ajouter des membres à l'organisation {{name}}",
  add_members_to_organization_description:
    "Trouvez les utilisateurs appropriés en recherchant leur nom, e-mail, téléphone ou identifiant d'utilisateur. Les membres existants ne sont pas affichés dans les résultats de la recherche.",
  add_with_organization_role: "Ajouter avec le(s) rôle(s) dans l'organisation",
  user: 'Utilisateur',
  application: 'Application',
  application_other: 'Applications',
  add_applications_to_organization: "Ajouter des applications à l'organisation {{name}}",
  add_applications_to_organization_description:
    "Trouvez les applications appropriées en recherchant l'ID de l'application, le nom ou la description. Les applications existantes ne sont pas affichées dans les résultats de la recherche.",
  at_least_one_application: 'Au moins une application est requise.',
  remove_application_from_organization: "Supprimer l'application de l'organisation",
  remove_application_from_organization_description:
    "Une fois supprimée, l'application perdra son association et ses rôles dans cette organisation. Cette action ne peut pas être annulée.",
  search_application_placeholder: "Rechercher par ID, nom ou description de l'application",
  roles: "Rôles de l'organisation",
  authorize_to_roles: 'Autoriser {{name}} à accéder aux rôles suivants :',
  edit_organization_roles: "Modifier les rôles de l'organisation",
  edit_organization_roles_title: "Modifier les rôles de l'organisation de {{name}}",
  remove_user_from_organization: "Retirer l'utilisateur de l'organisation",
  remove_user_from_organization_description:
    "Une fois retiré, l'utilisateur perdra son adhésion et ses rôles dans cette organisation. Cette action ne peut pas être annulée.",
  search_user_placeholder: "Rechercher par nom, e-mail, téléphone ou identifiant d'utilisateur",
  at_least_one_user: 'Au moins un utilisateur est requis.',
  organization_roles_tooltip: 'Les rôles attribués au {{type}} au sein de cette organisation.',
  custom_data: 'Données personnalisées',
  custom_data_tip:
    "Les données personnalisées sont un objet JSON qui peut être utilisé pour stocker des données supplémentaires associées à l'organisation.",
  invalid_json_object: 'Objet JSON non valide.',
  branding: {
    logo: "Logos de l'organisation",
    logo_tooltip:
      "Vous pouvez passer l'ID de l'organisation pour afficher ce logo dans l'expérience de connexion ; la version sombre du logo est nécessaire si le mode sombre est activé dans les paramètres de l'expérience de connexion omni. <a>Apprenez-en plus</a>",
  },
  jit: {
    title: 'Supply de juste-à-temps',
    description:
      "Les utilisateurs peuvent automatiquement rejoindre l'organisation et se voir attribuer des rôles dès leur première connexion via certaines méthodes d'authentification. Vous pouvez définir des exigences à remplir pour le supply de juste-à-temps.",
    email_domain: 'Approvisionnement de domaine de courrier électronique',
    email_domain_description:
      "Les nouveaux utilisateurs qui s'inscrivent avec leur adresse e-mail vérifiée ou via une connexion sociale avec des adresses e-mail vérifiées rejoindront automatiquement l'organisation. <a>Apprenez-en plus</a>",
    email_domain_placeholder:
      'Entrez des domaines de courrier électronique pour le supply de juste-à-temps',
    invalid_domain: 'Domaine non valide',
    domain_already_added: 'Domaine déjà ajouté',
    sso_enabled_domain_warning:
      "Vous avez saisi un ou plusieurs domaines de courrier électronique associés à un SSO d'entreprise. Les utilisateurs avec ces e-mails suivront le flux SSO standard et ne seront pas provisionnés pour cette organisation à moins que le provisionnement SSO d'entreprise ne soit configuré.",
    enterprise_sso: "Provisionnement SSO d'entreprise",
    no_enterprise_connector_set:
      "Vous n'avez encore configuré aucun connecteur SSO d'entreprise. Ajoutez d'abord des connecteurs pour activer le provisionnement SSO d'entreprise. <a>Configurer</a>",
    add_enterprise_connector: "Ajouter un connecteur d'entreprise",
    enterprise_sso_description:
      "Les nouveaux utilisateurs ou les utilisateurs existants se connectant via le SSO d'entreprise pour la première fois rejoindront automatiquement l'organisation. <a>Apprenez-en plus</a>",
    organization_roles: "Rôles d'organisation par défaut",
    organization_roles_description:
      "Attribuez des rôles aux utilisateurs lors de leur adhésion à l'organisation via le supply de juste-à-temps.",
  },
  mfa: {
    title: 'Authentification multi-facteurs (MFA)',
    tip: "Lorsque la MFA est requise, les utilisateurs sans MFA configurée seront rejetés lorsqu'ils essaient d'échanger un jeton d'organisation. Ce paramètre n'a pas d'incidence sur l'authentification des utilisateurs.",
    description:
      'Exigez que les utilisateurs configurent une authentification multi-facteurs pour accéder à cette organisation.',
    no_mfa_warning:
      "Aucune méthode d'authentification multi-facteurs n'est activée pour votre locataire. Les utilisateurs ne pourront pas accéder à cette organisation tant qu'au moins une <a>méthode d'authentification multi-facteurs</a> n'est pas activée.",
  },
};

export default Object.freeze(organization_details);
