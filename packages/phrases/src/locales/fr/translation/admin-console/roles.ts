const roles = {
  page_title: 'Rôles',
  title: 'Rôles',
  subtitle:
    "Les rôles incluent des autorisations qui déterminent ce qu'un utilisateur peut faire. RBAC utilise des rôles pour donner aux utilisateurs accès à des ressources pour des actions spécifiques.",
  create: 'Créer un rôle',
  role_name: 'Nom du rôle',
  role_type: 'Type de rôle',
  role_description: 'Description',
  role_name_placeholder: 'Entrez le nom de votre rôle',
  role_description_placeholder: 'Entrez la description de votre rôle',
  col_roles: 'Rôles',
  col_type: 'Type',
  col_description: 'Description',
  col_assigned_entities: 'Assigné',
  user_counts: '{{count}} utilisateurs',
  application_counts: '{{count}} applications',
  user_count: '{{count}} utilisateur',
  application_count: '{{count}} application',
  assign_permissions: 'Assigner des autorisations',
  create_role_title: 'Créer un rôle',
  create_role_button: 'Créer un rôle',
  role_created: 'Le rôle {{name}} a été créé avec succès.',
  search: 'Rechercher par nom de rôle, description ou ID',
  placeholder_title: 'Rôles',
  placeholder_description:
    "Les rôles sont un regroupement d'autorisations qui peuvent être assignées aux utilisateurs. Assurez-vous d'ajouter d'abord des autorisations avant de créer des rôles.",
  management_api_access_notification:
    "Pour accéder à l'API de gestion de Logto, sélectionnez des rôles avec les autorisations de l'API de gestion <flag/>.",
  with_management_api_access_tip:
    "Ce rôle machine à machine inclut les autorisations de l'API de gestion de Logto",
};

export default Object.freeze(roles);
