const organizations = {
  organization: 'Organisation',
  page_title: 'Organisationen',
  title: 'Organisationen',
  subtitle:
    'Organisationen werden üblicherweise in SaaS- oder ähnlichen Mehrbenutzeranwendungen verwendet und repräsentieren Ihre Kunden, die Teams, Organisationen oder ganze Unternehmen sind. Organisationen fungieren als grundlegende Elemente für B2B-Authentifizierung und Autorisierung.',
  organization_template: 'Organisationsvorlage',
  organization_id: 'Organisations-ID',
  members: 'Mitglieder',
  create_organization: 'Organisation erstellen',
  setup_organization: 'Richten Sie Ihre Organisation ein',
  organization_list_placeholder_title: 'Organisation',
  organization_list_placeholder_text:
    'Organisationen werden in SaaS- oder ähnlichen Mehrbenutzeranwendungen häufig als bewährte Methode verwendet. Sie ermöglichen es Ihnen, Apps zu entwickeln, die es Kunden ermöglichen, Organisationen zu erstellen und zu verwalten, Mitglieder einzuladen und Rollen zuzuweisen.',
  organization_name_placeholder: 'Meine Organisation',
  organization_description_placeholder: 'Eine kurze Beschreibung der Organisation',
  organization_permission: 'Organisationsberechtigung',
  organization_permission_other: 'Organisationsberechtigungen',
  create_permission_placeholder: 'Terminkalenderverlauf lesen',
  organization_role: 'Organisationsrolle',
  organization_role_other: 'Organisationsrollen',
  organization_role_description:
    'Eine Organisationsrolle ist eine Gruppierung von Berechtigungen, die Benutzern zugewiesen werden können. Die Berechtigungen müssen aus den vordefinierten Organisationsberechtigungen stammen.',
  role: 'Rolle',
  search_placeholder: 'Nach Organisation suchen',
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
        role_description_deprecated:
          'Eine Organisationsrolle ist eine Gruppierung von Organisationsberechtigungen, die Benutzern zugewiesen werden können.',
        role_description:
          'Die Organisationsrolle ist eine Gruppierung von Organisationsberechtigungen oder API-Berechtigungen, die Mitgliedern zugewiesen werden können.',
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
    organization_permissions: 'Organisationsberechtigungen',
    organization_roles: 'Organisationsrollen',
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
