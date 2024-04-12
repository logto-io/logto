const organizations = {
  organization: 'Organisation',
  page_title: 'Organisationen',
  title: 'Organisationen',
  /** UNTRANSLATED */
  subtitle:
    'Organizations are usually used in SaaS or similar multi-tenant apps and represent your clients which are teams, organizations, or entire companies. Organizations work as a foundational element for B2B authentication and authorization.',
  organization_template: 'Organisationsvorlage',
  organization_id: 'Organisations-ID',
  members: 'Mitglieder',
  create_organization: 'Organisation erstellen',
  setup_organization: 'Richten Sie Ihre Organisation ein',
  organization_list_placeholder_title: 'Organisation',
  /** UNTRANSLATED */
  organization_list_placeholder_text:
    'Organizations are often used in SaaS or similar multi-tenant apps as a best practice. They enable you to develop apps that allow clients to create and manage organizations, invite members, and assign roles.',
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
    'Eine Organisation ist eine Gruppe von Benutzern und kann Teams, Geschäftskunden und Partnerunternehmen darstellen, wobei jeder Benutzer ein "Mitglied" ist. Diese können grundlegende Entitäten sein, um Ihre Multi-Tenant-Anforderungen zu bearbeiten.',
  guide: {
    title: 'Beginnen Sie mit Anleitungen',
    subtitle: 'Starten Sie Ihre Organisationseinstellungen mit unseren Anleitungen',
    introduction: {
      title: 'Verstehen Sie, wie eine Organisation in Logto funktioniert',
      section_1: {
        title: 'Eine Organisation ist eine Gruppe von Benutzern (Identitäten)',
      },
      section_2: {
        title: 'Die Organisationsvorlage ist für den Zugriff auf Multi-Tenant-Apps konzipiert',
        description:
          'In Multi-Tenant-SaaS-Anwendungen teilen häufig mehrere Organisationen dieselbe Zugriffskontrollvorlage, zu der Berechtigungen und Rollen gehören. In Logto nennen wir es "Organisationsvorlage".',
        permission_description:
          'Die Organisationsberechtigung bezieht sich auf die Autorisierung zum Zugriff auf eine Ressource im Kontext der Organisation.',
        role_description:
          'Eine Organisationsrolle ist eine Gruppierung von Organisationsberechtigungen, die Benutzern zugewiesen werden können.',
      },
      section_3: {
        title: 'Kann ich API-Berechtigungen zu Organisationsrollen zuweisen?',
        description:
          'Ja, Sie können API-Berechtigungen zu Organisationsrollen zuweisen. Logto bietet die Flexibilität, die Rollen Ihrer Organisation effektiv zu verwalten, und ermöglicht es Ihnen, sowohl Organisationsberechtigungen als auch API-Berechtigungen in diese Rollen einzuschließen.',
      },
      section_4: {
        title: 'Interagieren Sie mit der Abbildung, um zu sehen, wie alles zusammenhängt',
        description:
          'Nehmen wir ein Beispiel. John, Sarah sind in verschiedenen Organisationen mit unterschiedlichen Rollen im Kontext verschiedener Organisationen. Fahren Sie mit der Maus über die verschiedenen Module und sehen Sie, was passiert.',
      },
    },
    step_1: 'Schritt 1: Organisationsberechtigungen definieren',
    step_2: 'Schritt 2: Organisationsrollen definieren',
    step_3: 'Schritt 3: Erstellen Sie Ihre erste Organisation',
    step_3_description:
      'Erstellen Sie Ihre erste Organisation. Sie erhält eine eindeutige ID und dient als Container für die Bearbeitung verschiedener geschäftsbezogener Identitäten.',
    more_next_steps: 'Weitere Schritte',
    add_members: 'Fügen Sie Mitglieder zu Ihrer Organisation hinzu',
    /** UNTRANSLATED */
    config_organization: 'Configure organization',
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
      'Die Rolle "{{role}}" teilt dieselbe Organisationsvorlage über verschiedene Organisationen.',
    john: 'John',
    john_tip:
      'John gehört zu zwei Organisationen mit der E-Mail "{{email}}" als eindeutiger Identifikator. Er ist der Administrator von Organisation A sowie der Gast von Organisation B.',
    sarah: 'Sarah',
    sarah_tip:
      'Sarah gehört zu einer Organisation mit der E-Mail "{{email}}" als eindeutiger Identifikator. Sie ist die Administratorin von Organisation B.',
  },
};

export default Object.freeze(organizations);
