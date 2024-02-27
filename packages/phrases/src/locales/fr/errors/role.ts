const role = {
  name_in_use: 'Ce nom de rôle {{name}} est déjà utilisé',
  scope_exists: "L'identifiant de portée {{scopeId}} a déjà été ajouté à ce rôle",
  /** UNTRANSLATED */
  management_api_scopes_not_assignable_to_user_role:
    'Cannot assign management API scopes to a user role.',
  user_exists: "L'identifiant d'utilisateur {{userId}} a déjà été ajouté à ce rôle",
  application_exists: "L'identifiant d'application {{applicationId}} a déjà été ajouté à ce rôle",
  default_role_missing:
    "Certains noms de rôles par défaut n'existent pas dans la base de données, veuillez vous assurer de créer d'abord des rôles",
  internal_role_violation:
    'Vous essayez peut-être de mettre à jour ou de supprimer un rôle interne, ce qui est interdit par Logto. Si vous créez un nouveau rôle, essayez un autre nom qui ne commence pas par "#internal:".',
};

export default Object.freeze(role);
