const protected_app = {
  name: 'Geschützte App',
  title:
    'Erstellen einer geschützten App: Fügen Sie Authentifizierung mit Einfachheit und epischer Geschwindigkeit hinzu',
  fast_create: 'Schnell erstellen',
  modal_title: 'Geschützte App erstellen',
  modal_subtitle:
    'Aktivieren Sie mit wenigen Klicks sicheren und schnellen Schutz. Fügen Sie Authentifizierung zu Ihrer vorhandenen Web-App hinzu mit Leichtigkeit',
  form: {
    url_field_label: 'Ihre Ursprungs-URL',
    url_field_placeholder: 'https://domain.com/',
    url_field_description:
      'Geben Sie die Adresse Ihrer App an, die einen Authentifizierungsschutz benötigt.',
    url_field_modification_notice:
      'Änderungen an der Ursprungs-URL können bis zu 1-2 Minuten dauern, um weltweit wirksam zu werden.',
    url_field_tooltip:
      "Geben Sie die Adresse Ihrer Anwendung an, ohne '/pathname'. Nach der Erstellung können Sie die Routenauthentifizierungsregeln anpassen.\n\nHinweis: Die Ursprungs-URL selbst erfordert keine Authentifizierung; Der Schutz wird ausschließlich für Aufrufe über die dafür vorgesehene App-Domäne angewendet.",
    domain_field_label: 'App-Domäne',
    domain_field_placeholder: 'ihre-domain',
    domain_field_description:
      'Diese URL dient als ein Authentifizierungsschutzproxy für die originale URL. Nach der Erstellung kann eine benutzerdefinierte Domain angewendet werden.',
    domain_field_description_short:
      'Diese URL dient als ein Authentifizierungsschutzproxy für die originale URL.',
    domain_field_tooltip:
      "Apps, die von Logto geschützt sind, werden standardmäßig unter 'ihre-domain.{{domain}}' gehostet. Eine benutzerdefinierte Domain kann nach der Erstellung angewendet werden.",
    create_application: 'Anwendung erstellen',
    create_protected_app: 'Schnell erstellen',
    errors: {
      domain_required: 'Ihre Domain ist erforderlich.',
      domain_in_use: 'Dieser Subdomänenname wird bereits verwendet.',
      invalid_domain_format:
        "Ungültiges Subdomänenformat: Verwenden Sie nur Kleinbuchstaben, Zahlen und Bindestriche '-'.",
      url_required: 'Ursprungs-URL ist erforderlich.',
      invalid_url:
        "Ungültiges Ursprungs-URL-Format: Verwenden Sie http:// oder https://. Hinweis: '/pathname' wird derzeit nicht unterstützt.",
      localhost:
        'Bitte belichten Sie zunächst Ihren lokalen Server im Internet. Erfahren Sie mehr über die <a> lokale Entwicklung </a>.',
    },
  },
  id_token_claims: {
    card_title: 'ID-Token-Claims',
    card_description:
      'Fordern Sie beim Anmelden in der geschützten App zusätzliche Benutzer-Scopes an, um aktivierte erweiterte Claims in das weitergeleitete ID-Token aufzunehmen.',
    field_title: 'Zusätzliche Scopes',
    field_description:
      'Claims werden nur einbezogen, wenn sie in <a>Custom JWT > ID token</a> aktiviert sind und der entsprechende Scope hier angefordert wird.',
    table_column_scope: 'Scope',
    table_column_claims_forwarded: 'Weitergeleitete Claims',
    disabled_claims_hint:
      'Ausgegraute Claims werden noch nicht weitergeleitet. Aktivieren Sie sie in <a>Custom JWT > ID token</a>, um sie in das ID-Token aufzunehmen.',
  },
  success_message:
    '🎉 App-Authentifizierung erfolgreich aktiviert! Entdecken Sie die neue Erfahrung Ihrer Webseite.',
};

export default Object.freeze(protected_app);
