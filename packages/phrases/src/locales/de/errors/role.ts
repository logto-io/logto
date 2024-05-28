const role = {
  name_in_use: 'Dieser Rollenname {{name}} wird bereits verwendet.',
  scope_exists: 'Die Scope-ID {{scopeId}} wurde bereits zu dieser Rolle hinzugefügt.',
  management_api_scopes_not_assignable_to_user_role:
    'Kann management API Scopes nicht einem Benutzerrolle zuweisen.',
  user_exists: 'Die Benutzer-ID {{userId}} wurde bereits zu dieser Rolle hinzugefügt.',
  application_exists:
    'Die Anwendungs-ID {{applicationId}} wurde bereits zu dieser Rolle hinzugefügt.',
  default_role_missing:
    'Einige der Standardrollennamen sind in der Datenbank nicht vorhanden. Bitte stellen Sie sicher, dass Sie zuerst Rollen erstellen.',
  internal_role_violation:
    'Sie versuchen möglicherweise, eine interne Rolle zu aktualisieren oder zu löschen, was von Logto verboten ist. Wenn Sie eine neue Rolle erstellen, versuchen Sie es mit einem anderen Namen, der nicht mit "#internal:" beginnt.',
};

export default Object.freeze(role);
