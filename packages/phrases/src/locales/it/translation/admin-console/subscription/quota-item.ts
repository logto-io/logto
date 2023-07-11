const quota_item = {
  tenant_limit: {
    name: 'Tenants',
    limited: '{{count, number}} tenant',
    limited_other: '{{count, number}} tenant',
    unlimited: 'Tenants illimitati',
  },
  mau_limit: {
    name: 'Utenti attivi mensili',
    limited: '{{count, number}} MAU',
    unlimited: 'Utenti attivi mensili illimitati',
  },
  applications_limit: {
    name: 'Applicazioni',
    limited: '{{count, number}} applicazione',
    limited_other: '{{count, number}} applicazione',
    unlimited: 'Applicazioni illimitate',
  },
  machine_to_machine_limit: {
    name: 'App Machine-to-Machine',
    limited: '{{count, number}} app Machine-to-Machine',
    limited_other: '{{count, number}} app Machine-to-Machine',
    unlimited: 'App Machine-to-Machine illimitate',
  },
  resources_limit: {
    name: 'Risorse API',
    limited: '{{count, number}} risorsa API',
    limited_other: '{{count, number}} risorsa API',
    unlimited: 'Risorse API illimitate',
  },
  scopes_per_resource_limit: {
    name: 'Autorizzazioni per risorsa',
    limited: '{{count, number}} autorizzazione per risorsa',
    limited_other: '{{count, number}} autorizzazione per risorsa',
    unlimited: 'Autorizzazioni per risorsa illimitate',
  },
  custom_domain_enabled: {
    name: 'Dominio personalizzato',
    limited: 'Dominio personalizzato',
    unlimited: 'Dominio personalizzato',
  },
  omni_sign_in_enabled: {
    name: 'Accesso Omni',
    limited: 'Accesso Omni',
    unlimited: 'Accesso Omni',
  },
  built_in_email_connector_enabled: {
    name: 'Connettore email integrato',
    limited: 'Connettore email integrato',
    unlimited: 'Connettore email integrato',
  },
  social_connectors_limit: {
    name: 'Connettori sociali',
    limited: '{{count, number}} connettore sociale',
    limited_other: '{{count, number}} connettore sociale',
    unlimited: 'Connettori sociali illimitati',
  },
  standard_connectors_limit: {
    name: 'Connettori standard gratuiti',
    limited: '{{count, number}} connettore standard gratuito',
    limited_other: '{{count, number}} connettore standard gratuito',
    unlimited: 'Connettori standard illimitati',
  },
  roles_limit: {
    name: 'Ruoli',
    limited: '{{count, number}} ruolo',
    limited_other: '{{count, number}} ruolo',
    unlimited: 'Ruoli illimitati',
  },
  scopes_per_role_limit: {
    name: 'Autorizzazioni per ruolo',
    limited: '{{count, number}} autorizzazione per ruolo',
    limited_other: '{{count, number}} autorizzazione per ruolo',
    unlimited: 'Autorizzazioni per ruolo illimitate',
  },
  hooks_limit: {
    name: 'Webhook',
    limited: '{{count, number}} webhook',
    limited_other: '{{count, number}} webhook',
    unlimited: 'Webhook illimitati',
  },
  audit_logs_retention_days: {
    name: 'Conservazione registri di controllo',
    limited: 'Conservazione registri di controllo: {{count, number}} giorno',
    limited_other: 'Conservazione registri di controllo: {{count, number}} giorni',
    unlimited: 'Giorni illimitati',
  },
  community_support_enabled: {
    name: 'Supporto comunitario',
    limited: 'Supporto comunitario',
    unlimited: 'Supporto comunitario',
  },
  customer_ticket_support: {
    name: 'Supporto mediante ticket personalizzato',
    limited: '{{count, number}} ora di supporto via ticket',
    limited_other: '{{count, number}} ora di supporto via ticket',
    unlimited: 'Supporto mediante ticket personalizzato',
  },
};

export default quota_item;
