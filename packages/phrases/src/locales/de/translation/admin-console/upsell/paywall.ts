const paywall = {
  applications:
    '{{count, number}} Anwendung von <planName/> erreicht. Plan upgraden, um den Bedürfnissen Ihres Teams gerecht zu werden. Für Unterstützung können Sie uns gerne <a>kontaktieren</a>.',
  applications_other:
    '{{count, number}} Anwendungen von <planName/> erreicht. Plan upgraden, um den Bedürfnissen Ihres Teams gerecht zu werden. Für Unterstützung können Sie uns gerne <a>kontaktieren</a>.',
  machine_to_machine_feature:
    'Wechseln Sie zum <strong>Pro</strong>-Plan, um zusätzliche Maschine-zu-Maschine-Anwendungen freizuschalten und alle Premium-Funktionen zu genießen. <a>Kontaktieren Sie uns</a>, wenn Sie Fragen haben.',
  machine_to_machine:
    '{{count, number}} Maschine-zu-Maschine-Anwendung von <planName/> erreicht. Plan upgraden, um den Bedürfnissen Ihres Teams gerecht zu werden. Für Unterstützung können Sie uns gerne <a>kontaktieren</a>.',
  machine_to_machine_other:
    '{{count, number}} Maschine-zu-Maschine-Anwendungen von <planName/> erreicht. Plan upgraden, um den Bedürfnissen Ihres Teams gerecht zu werden. Für Unterstützung können Sie uns gerne <a>kontaktieren</a>.',
  resources:
    'Sie haben das Limit von {{count, number}} <planName/>-API-Ressourcen erreicht. Upgraden Sie Ihren Plan, um den Anforderungen Ihres Teams gerecht zu werden. <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  resources_other:
    'Sie haben das Limit von {{count, number}} <planName/>-API-Ressourcen erreicht. Upgraden Sie Ihren Plan, um den Anforderungen Ihres Teams gerecht zu werden. <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  scopes_per_resource:
    'Sie haben das Limit von {{count, number}} Berechtigungen pro API-Ressource von <planName/> erreicht. Upgraden Sie jetzt, um zu erweitern. <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  scopes_per_resource_other:
    'Sie haben das Limit von {{count, number}} Berechtigungen pro API-Ressource von <planName/> erreicht. Upgraden Sie jetzt, um zu erweitern. <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  custom_domain:
    'Freischalten Sie die Funktion für benutzerdefinierte Domains, indem Sie auf den <strong>Hobby</strong>- oder <strong>Pro</strong>-Plan upgraden. Zögern Sie nicht, uns zu <a>kontaktieren</a>, wenn Sie Unterstützung benötigen.',
  social_connectors:
    'Sie haben das Limit von {{count, number}} <planName/>-Sozialconnectoren erreicht. Upgraden Sie Ihren Plan, um zusätzliche Sozialconnectoren und die Möglichkeit zur Erstellung eigener Connectoren mit OIDC, OAuth 2.0 und SAML-Protokollen zu erhalten. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  social_connectors_other:
    'Sie haben das Limit von {{count, number}} <planName/>-Sozialconnectoren erreicht. Upgraden Sie Ihren Plan, um zusätzliche Sozialconnectoren und die Möglichkeit zur Erstellung eigener Connectoren mit OIDC, OAuth 2.0 und SAML-Protokollen zu erhalten. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  standard_connectors_feature:
    'Upgrade auf den <strong>Hobby</strong>- oder <strong>Pro</strong>-Plan, um eigene Connectoren unter Verwendung von OIDC, OAuth 2.0 und SAML-Protokollen zu erstellen, sowie unbegrenzte Sozialconnectoren und alle Premium-Funktionen. Zögern Sie nicht, uns zu <a>kontaktieren</a>, wenn Sie Hilfe benötigen.',
  standard_connectors:
    'Sie haben das Limit von {{count, number}} <planName/>-Sozialconnectoren erreicht. Upgraden Sie Ihren Plan, um zusätzliche Sozialconnectoren und die Möglichkeit zur Erstellung eigener Connectoren mit OIDC, OAuth 2.0 und SAML-Protokollen zu erhalten. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  standard_connectors_other:
    'Sie haben das Limit von {{count, number}} <planName/>-Sozialconnectoren erreicht. Upgraden Sie Ihren Plan, um zusätzliche Sozialconnectoren und die Möglichkeit zur Erstellung eigener Connectoren mit OIDC, OAuth 2.0 und SAML-Protokollen zu erhalten. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  standard_connectors_pro:
    'Sie haben das Limit von {{count, number}} <planName/>-Standardconnectoren erreicht. Upgraden Sie auf den Enterprise-Plan, um zusätzliche Sozialconnectoren und die Möglichkeit zur Erstellung eigener Connectoren mit OIDC, OAuth 2.0 und SAML-Protokollen zu erhalten. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  standard_connectors_pro_other:
    'Sie haben das Limit von {{count, number}} <planName/>-Standardconnectoren erreicht. Upgraden Sie auf den Enterprise-Plan, um zusätzliche Sozialconnectoren und die Möglichkeit zur Erstellung eigener Connectoren mit OIDC, OAuth 2.0 und SAML-Protokollen zu erhalten. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  roles:
    'Upgraden Sie den Plan, um zusätzliche Rollen und Berechtigungen hinzuzufügen. Gerne können Sie sich <a>an uns wenden</a>, wenn Sie Unterstützung benötigen.',
  scopes_per_role:
    'Sie haben das Limit von {{count, number}} Berechtigungen pro Rolle von <planName/> erreicht. Upgraden Sie Ihren Plan, um zusätzliche Rollen und Berechtigungen hinzuzufügen. Bei Fragen stehen wir Ihnen gerne zur Verfügung. <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  scopes_per_role_other:
    'Sie haben das Limit von {{count, number}} Berechtigungen pro Rolle von <planName/> erreicht. Upgraden Sie Ihren Plan, um zusätzliche Rollen und Berechtigungen hinzuzufügen. Bei Fragen stehen wir Ihnen gerne zur Verfügung. <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  saml_applications_oss:
    'Die zusätzliche SAML-App ist mit dem Logto-Enterprise-Plan verfügbar. Kontaktieren Sie uns, wenn Sie Hilfe benötigen.',
  logto_pricing_button_text: 'Logto Cloud-Preise',
  saml_applications:
    'Die zusätzliche SAML-App ist mit dem Logto-Enterprise-Plan verfügbar. Kontaktieren Sie uns, wenn Sie Hilfe benötigen.',
  saml_applications_add_on:
    'Schalten Sie die SAML-App-Funktion frei, indem Sie auf einen kostenpflichtigen Plan upgraden. Gerne können Sie sich <a>an uns wenden</a>, wenn Sie Unterstützung benötigen.',
  hooks:
    'Sie haben das Limit von {{count, number}} <planName/>-Webhooks erreicht. Upgraden Sie Ihren Plan, um mehr Webhooks zu erstellen. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  hooks_other:
    'Sie haben das Limit von {{count, number}} <planName/>-Webhooks erreicht. Upgraden Sie Ihren Plan, um mehr Webhooks zu erstellen. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  mfa: 'Schalten Sie MFA zur Sicherheitsüberprüfung frei, indem Sie auf einen kostenpflichtigen Plan aktualisieren. Zögern Sie nicht, uns zu <a>kontaktieren</a>, wenn Sie Unterstützung benötigen.',
  organizations:
    'Organisationen freischalten, indem Sie auf einen kostenpflichtigen Plan aktualisieren. Zögern Sie nicht, <a>kontaktieren Sie uns</a>, wenn Sie Unterstützung benötigen.',
  third_party_apps:
    'Entsperren Sie Logto als IdP für Drittanbieter-Apps, indem Sie auf einen kostenpflichtigen Plan aktualisieren. Bei Bedarf können Sie uns gerne <a>kontaktieren</a>.',
  sso_connectors:
    'Schalten Sie Enterprise-SSO frei, indem Sie auf einen kostenpflichtigen Plan aktualisieren. Bei Bedarf können Sie uns gerne <a>kontaktieren</a>.',
  tenant_members:
    'Aktivieren Sie die Kollaborationsfunktion durch ein Upgrade auf einen kostenpflichtigen Plan. Bei Bedarf können Sie uns gerne <a>kontaktieren</a>.',
  tenant_members_dev_plan:
    'Sie haben Ihr Limit von {{limit}} Mitgliedern erreicht. Geben Sie ein Mitglied frei oder widerrufen Sie eine ausstehende Einladung, um jemand neuen hinzuzufügen. Benötigen Sie mehr Plätze? Zögern Sie nicht, uns zu kontaktieren.',
  custom_jwt: {
    title: 'Benutzerdefinierte Claims hinzufügen',
    description:
      'Upgrade auf einen kostenpflichtigen Plan für benutzerdefinierte JWT-Funktionalität und Premium-Vorteile. Wenn Sie Fragen haben, zögern Sie nicht, uns zu <a>kontaktieren</a>.',
  },
  bring_your_ui:
    'Upgrade auf einen kostenpflichtigen Plan für benutzerdefinierte UI-Funktionalität und Premium-Vorteile.',
  security_features:
    'Schalten Sie erweiterte Sicherheitsfunktionen durch ein Upgrade auf den Pro-Plan frei. Zögern Sie nicht, uns zu <a>kontaktieren</a>, wenn Sie Fragen haben.',
  collect_user_profile:
    'Upgraden Sie auf einen kostenpflichtigen Plan, um bei der Anmeldung zusätzliche Benutzerprofilinformationen zu sammeln. Zögern Sie nicht, uns zu <a>kontaktieren</a>, wenn Sie Fragen haben.',
};

export default Object.freeze(paywall);
