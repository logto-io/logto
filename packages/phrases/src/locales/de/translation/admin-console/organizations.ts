const organizations = {
  organization: 'Organisation',
  page_title: 'Organisationen',
  title: 'Organisationen',
  subtitle:
    'Eine Organisation ist eine Sammlung von Benutzern, zu der Teams, Geschäftskunden und Partnerfirmen gehören, die Ihre Anwendungen nutzen.',
  organization_template: 'Organisation-Vorlage',
  organization_id: 'Organisations-ID',
  members: 'Mitglieder',
  create_organization: 'Organisation erstellen',
  setup_organization: 'Richten Sie Ihre Organisation ein',
  organization_list_placeholder_title: 'Organisation',
  organization_list_placeholder_text:
    'Organisation wird normalerweise in SaaS- oder SaaS-ähnlichen Multi-Tenancy-Anwendungen verwendet. Die Funktion "Organisationen" ermöglicht es Ihren B2B-Kunden, ihre Partner und Kunden besser zu verwalten und die Art und Weise anzupassen, wie Endbenutzer auf ihre Anwendungen zugreifen.',
  organization_name_placeholder: 'Meine Organisation',
  organization_description_placeholder: 'Eine kurze Beschreibung der Organisation',
  organization_permission: 'Organisationsberechtigung',
  organization_permission_other: 'Organisationsberechtigungen',
  organization_permission_description:
    'Eine Organisationsberechtigung bezieht sich auf die Autorisierung zum Zugriff auf eine Ressource im Kontext der Organisation. Eine Organisationsberechtigung sollte als aussagekräftiger String repräsentiert werden, der auch als Name und eindeutiger Bezeichner dient.',
  organization_permission_delete_confirm:
    'Wenn diese Berechtigung gelöscht wird, verlieren alle Organisationsrollen, einschließlich dieser Berechtigung, diese Berechtigung. Benutzer, die diese Berechtigung hatten, verlieren den Zugriff, der durch sie gewährt wurde.',
  create_permission_placeholder: 'Terminkalenderverlauf lesen',
  permission: 'Berechtigung',
  permission_other: 'Berechtigungen',
  organization_role: 'Organisationsrolle',
  organization_role_other: 'Organisationsrollen',
  organization_role_description:
    'Eine Organisationsrolle ist eine Gruppierung von Berechtigungen, die Benutzern zugewiesen werden können. Die Berechtigungen müssen aus den vordefinierten Organisationsberechtigungen stammen.',
  organization_role_delete_confirm:
    'Dadurch werden die mit dieser Rolle verbundenen Berechtigungen von den betroffenen Benutzern entfernt und die Beziehungen zwischen Organisationsrollen, Mitgliedern in der Organisation und Organisationsberechtigungen gelöscht.',
  role: 'Rolle',
  create_role_placeholder: 'Benutzer mit nur Lesezugriff',
  search_placeholder: 'Nach Organisation suchen',
  search_permission_placeholder: 'Geben Sie zum Suchen und Auswählen von Berechtigungen ein',
  search_role_placeholder: 'Geben Sie zum Suchen und Auswählen von Rollen ein',
  empty_placeholder: '🤔 Sie haben noch keine {{entity}} eingerichtet.',
  organization_and_member: 'Organisation und Mitglied',
  organization_and_member_description:
    'Organisation ist eine Gruppe von Benutzern und kann die Teams, Geschäftskunden und Partnerfirmen repräsentieren, wobei jeder Benutzer ein "Mitglied" ist. Diese können grundlegende Entitäten zur Bewältigung Ihrer Multi-Tenant-Anforderungen sein.',
  guide: {
    title: 'Mit Anleitungen starten',
    subtitle: 'Starten Sie Ihre Organisationseinstellungen mit unseren Anleitungen',
    introduction: {
      title: 'Verstehen Sie, wie Organisation in Logto funktioniert',
      section_1: {
        title: 'Eine Organisation ist eine Gruppe von Benutzern (Identitäten)',
      },
      section_2: {
        title: 'Organisationsvorlage ist für den Zugriff auf Multi-Tenant-Apps konzipiert',
        description:
          'In Multi-Tenant-SaaS-Anwendungen teilen oft mehrere Organisationen dieselbe Zugriffskontrollvorlage, die Berechtigungen und Rollen umfasst. In Logto nennen wir es "Organisationsvorlage".',
        permission_description:
          'Organisationsberechtigung bezieht sich auf die Autorisierung zum Zugriff auf eine Ressource im Kontext der Organisation.',
        role_description:
          'Organisationsrolle ist eine Gruppierung von Organisationsberechtigungen, die Mitgliedern zugewiesen werden können.',
      },
      section_3: {
        title: 'Interagieren Sie mit der Abbildung, um zu sehen, wie alles zusammenhängt',
        description:
          'Lassen Sie uns ein Beispiel nehmen. John, Sarah sind in verschiedenen Organisationen mit unterschiedlichen Rollen im Kontext verschiedener Organisationen. Fahren Sie über die verschiedenen Module und sehen Sie, was passiert.',
      },
    },
    step_1: 'Schritt 1: Organisationsberechtigungen definieren',
    step_2: 'Schritt 2: Organisationsrollen definieren',
    step_3: 'Schritt 3: Erstellen Sie Ihre erste Organisation',
    step_3_description:
      'Lassen Sie uns Ihre erste Organisation erstellen. Sie hat eine eindeutige ID und dient als Container zur Behandlung verschiedener geschäftsbezogener Identitäten.',
    more_next_steps: 'Weitere Schritte',
    add_members: 'Fügen Sie Mitglieder zu Ihrer Organisation hinzu',
    add_members_action: 'Fügen Sie Mitglieder in großen Mengen hinzu und weisen Sie Rollen zu',
    organization_permissions: 'Organisationsberechtigungen',
    permission_name: 'Berechtigungsname',
    permissions: 'Berechtigungen',
    organization_roles: 'Organisationsrollen',
    role_name: 'Rollenname',
    organization_name: 'Organisationsname',
    admin: 'Admin',
    member: 'Mitglied',
    guest: 'Gast',
    role_description:
      'Rolle "{{role}}" teilt die gleiche Organisationsvorlage über verschiedene Organisationen.',
    john: 'John',
    john_tip:
      'John gehört zu zwei Organisationen mit der E-Mail "john@email.com" als eindeutige Kennung. Er ist der Administrator der Organisation A und Gast der Organisation B.',
    sarah: 'Sarah',
    sarah_tip:
      'Sarah gehört zu einer Organisation mit der E-Mail "sarah@email.com" als eindeutige Kennung. Sie ist die Administratorin der Organisation B.',
  },
};

export default Object.freeze(organizations);
