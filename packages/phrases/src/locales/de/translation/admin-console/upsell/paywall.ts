const paywall = {
  applications:
    '{{count, number}} Anwendung von <planName/> erreicht. Plan upgraden, um den Bedürfnissen Ihres Teams gerecht zu werden. Für Unterstützung können Sie uns gerne <a>kontaktieren</a>.',
  applications_other:
    '{{count, number}} Anwendungen von <planName/> erreicht. Plan upgraden, um den Bedürfnissen Ihres Teams gerecht zu werden. Für Unterstützung können Sie uns gerne <a>kontaktieren</a>.',
  machine_to_machine_feature:
    'Upgraden Sie auf einen kostenpflichtigen Tarif, um eine Maschinen-zu-Maschinen-Anwendung zu erstellen und Zugriff auf alle Premium-Funktionen zu erhalten. Für Unterstützung können Sie uns gerne <a>kontaktieren</a>.',
  machine_to_machine:
    '{{count, number}} Maschine-zu-Maschine-Anwendung von <planName/> erreicht. Plan upgraden, um den Bedürfnissen Ihres Teams gerecht zu werden. Für Unterstützung können Sie uns gerne <a>kontaktieren</a>.',
  machine_to_machine_other:
    '{{count, number}} Maschine-zu-Maschine-Anwendungen von <planName/> erreicht. Plan upgraden, um den Bedürfnissen Ihres Teams gerecht zu werden. Für Unterstützung können Sie uns gerne <a>kontaktieren</a>.',
  resources:
    'Sie haben das Limit von {{count, number}} <planName/>-API-Ressourcen erreicht. Upgraden Sie Ihren Plan, um den Anforderungen Ihres Teams gerecht zu werden. <a>Kontaktieren Sie uns</a> bei Bedarf.',
  resources_other:
    'Sie haben das Limit von {{count, number}} <planName/>-API-Ressourcen erreicht. Upgraden Sie Ihren Plan, um den Anforderungen Ihres Teams gerecht zu werden. <a>Kontaktieren Sie uns</a> bei Bedarf.',
  scopes_per_resource:
    'Sie haben das Limit von {{count, number}} Berechtigungen pro API-Ressource von <planName/> erreicht. Upgraden Sie jetzt, um zu erweitern. <a>Kontaktieren Sie uns</a> bei Bedarf.',
  scopes_per_resource_other:
    'Sie haben das Limit von {{count, number}} Berechtigungen pro API-Ressource von <planName/> erreicht. Upgraden Sie jetzt, um zu erweitern. <a>Kontaktieren Sie uns</a> bei Bedarf.',
  custom_domain:
    'Schalten Sie die Funktion für individuelle Domains frei und profitieren Sie von einer Reihe von Premium-Vorteilen, indem Sie auf einen kostenpflichtigen Plan upgraden. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  social_connectors:
    'Sie haben das Limit von {{count, number}} <planName/>-Sozialconnectoren erreicht. Upgraden Sie Ihren Plan, um zusätzliche Sozialconnectoren und die Möglichkeit zur Erstellung eigener Connectoren mit OIDC, OAuth 2.0 und SAML-Protokollen zu erhalten. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  social_connectors_other:
    'Sie haben das Limit von {{count, number}} <planName/>-Sozialconnectoren erreicht. Upgraden Sie Ihren Plan, um zusätzliche Sozialconnectoren und die Möglichkeit zur Erstellung eigener Connectoren mit OIDC, OAuth 2.0 und SAML-Protokollen zu erhalten. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  standard_connectors_feature:
    'Upgraden Sie auf einen kostenpflichtigen Plan, um eigene Connectoren mit OIDC, OAuth 2.0 und SAML-Protokollen zu erstellen, sowie unbegrenzte Sozialconnectoren und alle Premium-Funktionen zu erhalten. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  standard_connectors:
    'Sie haben das Limit von {{count, number}} <planName/>-Sozialconnectoren erreicht. Upgraden Sie Ihren Plan, um zusätzliche Sozialconnectoren und die Möglichkeit zur Erstellung eigener Connectoren mit OIDC, OAuth 2.0 und SAML-Protokollen zu erhalten. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  standard_connectors_other:
    'Sie haben das Limit von {{count, number}} <planName/>-Sozialconnectoren erreicht. Upgraden Sie Ihren Plan, um zusätzliche Sozialconnectoren und die Möglichkeit zur Erstellung eigener Connectoren mit OIDC, OAuth 2.0 und SAML-Protokollen zu erhalten. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  standard_connectors_pro:
    'Sie haben das Limit von {{count, number}} <planName/>-Standardconnectoren erreicht. Upgraden Sie auf den Enterprise-Plan, um zusätzliche Sozialconnectoren und die Möglichkeit zur Erstellung eigener Connectoren mit OIDC, OAuth 2.0 und SAML-Protokollen zu erhalten. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  standard_connectors_pro_other:
    'Sie haben das Limit von {{count, number}} <planName/>-Standardconnectoren erreicht. Upgraden Sie auf den Enterprise-Plan, um zusätzliche Sozialconnectoren und die Möglichkeit zur Erstellung eigener Connectoren mit OIDC, OAuth 2.0 und SAML-Protokollen zu erhalten. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  roles:
    'Sie haben das Limit von {{count, number}} <planName/>-Rollen erreicht. Upgraden Sie Ihren Plan, um zusätzliche Rollen und Berechtigungen hinzuzufügen. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  roles_other:
    'Sie haben das Limit von {{count, number}} <planName/>-Rollen erreicht. Upgraden Sie Ihren Plan, um zusätzliche Rollen und Berechtigungen hinzuzufügen. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  scopes_per_role:
    'Sie haben das Limit von {{count, number}} Berechtigungen pro Rolle von <planName/> erreicht. Upgraden Sie Ihren Plan, um zusätzliche Rollen und Berechtigungen hinzuzufügen. Bei Fragen stehen wir Ihnen gerne zur Verfügung. <a>Kontaktieren Sie uns</a>.',
  scopes_per_role_other:
    'Sie haben das Limit von {{count, number}} Berechtigungen pro Rolle von <planName/> erreicht. Upgraden Sie Ihren Plan, um zusätzliche Rollen und Berechtigungen hinzuzufügen. Bei Fragen stehen wir Ihnen gerne zur Verfügung. <a>Kontaktieren Sie uns</a>.',
  hooks:
    'Sie haben das Limit von {{count, number}} <planName/>-Webhooks erreicht. Upgraden Sie Ihren Plan, um mehr Webhooks zu erstellen. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
  hooks_other:
    'Sie haben das Limit von {{count, number}} <planName/>-Webhooks erreicht. Upgraden Sie Ihren Plan, um mehr Webhooks zu erstellen. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
};

export default Object.freeze(paywall);
