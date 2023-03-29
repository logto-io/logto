const connector = {
  general: 'Fehler aufgetreten im Connector: {{errorDescription}}',
  not_found: 'Kein verfügbarer Connector für Typ {{type}} gefunden.',
  not_enabled: 'Der Connector ist nicht aktiviert.',
  invalid_metadata: 'Die Metadaten des Connectors sind ungültig.',
  invalid_config_guard: 'Die Konfiguration des Connectors ist ungültig.',
  unexpected_type: 'Der Typ des Connectors ist unerwartet.',
  invalid_request_parameters: 'Die Anfrage enthält falsche Eingabeparameter.',
  insufficient_request_parameters:
    'Die Anfrage enthält möglicherweise nicht alle erforderlichen Eingabeparameter.',
  invalid_config: 'Die Konfiguration des Connectors ist ungültig.',
  invalid_response: 'Die Antwort des Connectors ist ungültig.',
  template_not_found:
    'Die richtige Vorlage in der Connector-Konfiguration konnte nicht gefunden werden.',
  not_implemented: '{{method}}: wurde noch nicht implementiert.',
  social_invalid_access_token: 'Der Access Token des Connectors ist ungültig.',
  invalid_auth_code: 'Der Authentifizierungscode des Connectors ist ungültig.',
  social_invalid_id_token: 'Der ID-Token des Connectors ist ungültig.',
  authorization_failed: 'Der Autorisierungsprozess des Benutzers war erfolglos.',
  social_auth_code_invalid:
    'Es konnte kein Access Token abgerufen werden. Bitte prüfen Sie den Autorisierungscode.',
  more_than_one_sms: 'Die Anzahl der SMS-Connectors ist größer als 1.',
  more_than_one_email: 'Die Anzahl der E-Mail-Connectors ist größer als 1.',
  more_than_one_connector_factory:
    'Mehrere Connector-Fabriken gefunden (mit ID {{connectorIds}}). Sie können unnötige Fabriken deinstallieren.',
  db_connector_type_mismatch:
    'Es gibt einen Connector in der Datenbank, der nicht dem Typ entspricht.',
  not_found_with_connector_id:
    'Connector mit der angegebenen Standard-Connector-ID konnte nicht gefunden werden.',
  multiple_instances_not_supported:
    'Es können keine mehreren Instanzen mit dem ausgewählten Standard-Connector erstellt werden.',
  invalid_type_for_syncing_profile:
    'Sie können nur Benutzerprofile mit sozialen Connectors synchronisieren.',
  can_not_modify_target: "Der 'target'-Connector kann nicht geändert werden.",
  should_specify_target: "Sie sollten den 'target' angeben.",
  multiple_target_with_same_platform:
    'Sie können keine mehreren sozialen Connectors haben, die das gleiche Ziel und die gleiche Plattform haben.',
  cannot_overwrite_metadata_for_non_standard_connector:
    "Die 'Metadaten' dieses Connectors können nicht überschrieben werden.",
};
export default connector;
