const paywall = {
  applications:
    'Osiągnięto limit {{count, number}} aplikacji dla <planName/>. Zaktualizuj plan, aby sprostać potrzebom zespołu. W razie potrzeby pomocy, proszę <a>skontaktuj się z nami</a>.',
  applications_other:
    'Osiągnięto limit {{count, number}} aplikacji dla <planName/>. Zaktualizuj plan, aby sprostać potrzebom zespołu. W razie potrzeby pomocy, proszę <a>skontaktuj się z nami</a>.',
  machine_to_machine_feature:
    'Przełącz się na plan <strong>Pro</strong>, aby uzyskać dodatkowe aplikacje maszynowe i korzystać ze wszystkich funkcji premium. <a>Skontaktuj się z nami</a>, jeśli masz pytania.',
  machine_to_machine:
    'Osiągnięto limit {{count, number}} aplikacji maszynowych dla <planName/>. Zaktualizuj plan, aby sprostać potrzebom zespołu. W razie potrzeby pomocy, proszę <a>skontaktuj się z nami</a>.',
  machine_to_machine_other:
    'Osiągnięto limit {{count, number}} aplikacji maszynowych dla <planName/>. Zaktualizuj plan, aby sprostać potrzebom zespołu. W razie potrzeby pomocy, proszę <a>skontaktuj się z nami</a>.',
  resources:
    'Osiągnięto limit {{count, number}} zasobów API w planie <planName/>. Ulepsz plan, aby sprostać potrzebom twojego zespołu. Skontaktuj się z nami <a>tutaj</a>, jeśli potrzebujesz pomocy.',
  resources_other:
    'Osiągnięto limit {{count, number}} zasobów API w planie <planName/>. Ulepsz plan, aby sprostać potrzebom twojego zespołu. Skontaktuj się z nami <a>tutaj</a>, jeśli potrzebujesz pomocy.',
  scopes_per_resource:
    'Osiągnięto limit {{count, number}} uprawnień na zasób API w planie <planName/>. Zaktualizuj plan, aby rozszerzyć. Skontaktuj się z nami <a>tutaj</a>, jeśli potrzebujesz pomocy.',
  scopes_per_resource_other:
    'Osiągnięto limit {{count, number}} uprawnień na zasób API w planie <planName/>. Zaktualizuj plan, aby rozszerzyć. Skontaktuj się z nami <a>tutaj</a>, jeśli potrzebujesz pomocy.',
  custom_domain:
    'Odblokuj funkcję niestandardowej domeny, ulepszając do planu <strong>Hobby</strong> lub <strong>Pro</strong>. Nie wahaj się <a>skontaktować z nami</a>, jeśli potrzebujesz pomocy.',
  social_connectors:
    'Osiągnięto limit {{count, number}} konektorów społecznościowych w planie <planName/>. Aby sprostać potrzebom twojego zespołu, ulepsz plan, aby uzyskać dodatkowe konektory społecznościowe oraz możliwość tworzenia własnych konektorów za pomocą protokołów OIDC, OAuth 2.0 i SAML. Jeśli potrzebujesz pomocy, nie wahaj się <a>skontaktować z nami</a>.',
  social_connectors_other:
    'Osiągnięto limit {{count, number}} konektorów społecznościowych w planie <planName/>. Aby sprostać potrzebom twojego zespołu, ulepsz plan, aby uzyskać dodatkowe konektory społecznościowe oraz możliwość tworzenia własnych konektorów za pomocą protokołów OIDC, OAuth 2.0 i SAML. Jeśli potrzebujesz pomocy, nie wahaj się <a>skontaktować z nami</a>.',
  standard_connectors_feature:
    'Ulepsz do planu <strong>Hobby</strong> lub <strong>Pro</strong>, aby tworzyć własne konektory za pomocą protokołów OIDC, OAuth 2.0 i SAML, plus nieograniczone konektory społecznościowe i wszystkie funkcje premium. Jeśli potrzebujesz pomocy, nie wahaj się <a>skontaktować z nami</a>.',
  standard_connectors:
    'Osiągnięto limit {{count, number}} konektorów społecznościowych w planie <planName/>. Aby sprostać potrzebom twojego zespołu, ulepsz plan, aby uzyskać dodatkowe konektory społecznościowe oraz możliwość tworzenia własnych konektorów za pomocą protokołów OIDC, OAuth 2.0 i SAML. Jeśli potrzebujesz pomocy, nie wahaj się <a>skontaktować z nami</a>.',
  standard_connectors_other:
    'Osiągnięto limit {{count, number}} konektorów społecznościowych w planie <planName/>. Aby sprostać potrzebom twojego zespołu, ulepsz plan, aby uzyskać dodatkowe konektory społecznościowe oraz możliwość tworzenia własnych konektorów za pomocą protokołów OIDC, OAuth 2.0 i SAML. Jeśli potrzebujesz pomocy, nie wahaj się <a>skontaktować z nami</a>.',
  standard_connectors_pro:
    'Osiągnięto limit {{count, number}} standardowych konektorów w planie <planName/>. Aby sprostać potrzebom twojego zespołu, ulepsz do planu Enterprise, aby uzyskać dodatkowe konektory społecznościowe oraz możliwość tworzenia własnych konektorów za pomocą protokołów OIDC, OAuth 2.0 i SAML. Jeśli potrzebujesz pomocy, nie wahaj się <a>skontaktować z nami</a>.',
  standard_connectors_pro_other:
    'Osiągnięto limit {{count, number}} standardowych konektorów w planie <planName/>. Aby sprostać potrzebom twojego zespołu, ulepsz do planu Enterprise, aby uzyskać dodatkowe konektory społecznościowe oraz możliwość tworzenia własnych konektorów za pomocą protokołów OIDC, OAuth 2.0 i SAML. Jeśli potrzebujesz pomocy, nie wahaj się <a>skontaktować z nami</a>.',
  roles:
    'Osiągnięto limit {{count, number}} ról w planie <planName/>. Ulepsz plan, aby dodać dodatkowe role i uprawnienia. Jeśli potrzebujesz pomocy, nie wahaj się <a>skontaktować z nami</a>.',
  roles_other:
    'Osiągnięto limit {{count, number}} ról w planie <planName/>. Ulepsz plan, aby dodać dodatkowe role i uprawnienia. Jeśli potrzebujesz pomocy, nie wahaj się <a>skontaktować z nami</a>.',
  machine_to_machine_roles:
    '{{count, number}} role maszynowa przekroczyła limit w planie <planName/>. Ulepsz plan, aby dodać dodatkowe role i uprawnienia. Skontaktuj się z nami <a>tutaj</a>, jeśli potrzebujesz pomocy.',
  machine_to_machine_roles_other:
    '{{count, number}} role maszynowa przekroczyły limit w planie <planName/>. Ulepsz plan, aby dodać dodatkowe role i uprawnienia. Skontaktuj się z nami <a>tutaj</a>, jeśli potrzebujesz pomocy.',
  scopes_per_role:
    'Osiągnięto limit {{count, number}} uprawnień na rolę w planie <planName/>. Ulepsz plan, aby dodać dodatkowe role i uprawnienia. W razie potrzeb, skontaktuj się z nami <a>tutaj</a>.',
  scopes_per_role_other:
    'Osiągnięto limit {{count, number}} uprawnień na rolę w planie <planName/>. Ulepsz plan, aby dodać dodatkowe role i uprawnienia. W razie potrzeb, skontaktuj się z nami <a>tutaj</a>.',
  hooks:
    'Osiągnięto limit {{count, number}} webhooków w planie <planName/>. Ulepsz plan, aby tworzyć więcej webhooków. Jeśli potrzebujesz pomocy, nie wahaj się <a>skontaktować z nami</a>.',
  hooks_other:
    'Osiągnięto limit {{count, number}} webhooków w planie <planName/>. Ulepsz plan, aby tworzyć więcej webhooków. Jeśli potrzebujesz pomocy, nie wahaj się <a>skontaktować z nami</a>.',
  mfa: 'Odblokuj MFA, aby zweryfikować bezpieczeństwo, przechodząc na płatny plan. Nie wahaj się <a>skontaktować z nami</a>, jeśli potrzebujesz pomocy.',
  organizations:
    'Odblokuj organizacje, ulepszając do płatnego planu. Nie wahaj się <a>skontaktować z nami</a>, jeśli potrzebujesz pomocy.',
  /** UNTRANSLATED */
  third_party_apps:
    'Unlock Logto as IdP for third-party apps by upgrading to a paid plan. For any assistance, feel free to <a>contact us</a>.',
  /** UNTRANSLATED */
  sso_connectors:
    'Unlock enterprise sso by upgrading to a paid plan. For any assistance, feel free to <a>contact us</a>.',
  /** UNTRANSLATED */
  tenant_members:
    'Unlock collaboration feature by upgrading to a paid plan. For any assistance, feel free to <a>contact us</a>.',
  /** UNTRANSLATED */
  tenant_members_dev_plan:
    "You've reached your {{limit}}-member limit. Release a member or revoke a pending invitation to add someone new. Need more seats? Feel free to contact us.",
};

export default Object.freeze(paywall);
