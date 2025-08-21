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
    'Zaktualizuj plan, aby dodać dodatkowe role i uprawnienia. Nie wahaj się <a>skontaktować z nami</a>, jeśli potrzebujesz pomocy.',
  scopes_per_role:
    'Osiągnięto limit {{count, number}} uprawnień na rolę w planie <planName/>. Ulepsz plan, aby dodać dodatkowe role i uprawnienia. W razie potrzeb, skontaktuj się z nami <a>tutaj</a>.',
  scopes_per_role_other:
    'Osiągnięto limit {{count, number}} uprawnień na rolę w planie <planName/>. Ulepsz plan, aby dodać dodatkowe role i uprawnienia. W razie potrzeb, skontaktuj się z nami <a>tutaj</a>.',
  saml_applications_oss:
    'Dodatkowa aplikacja SAML jest dostępna w planie Logto Enterprise. Skontaktuj się z nami, jeśli potrzebujesz pomocy.',
  logto_pricing_button_text: 'Cennik Logto Cloud',
  saml_applications:
    'Dodatkowa aplikacja SAML jest dostępna w planie Logto Enterprise. Skontaktuj się z nami, jeśli potrzebujesz pomocy.',
  saml_applications_add_on:
    'Odblokuj funkcję aplikacji SAML, ulepszając do płatnego planu. Nie wahaj się <a>skontaktować z nami</a>, jeśli potrzebujesz pomocy.',
  hooks:
    'Osiągnięto limit {{count, number}} webhooków w planie <planName/>. Ulepsz plan, aby tworzyć więcej webhooków. Jeśli potrzebujesz pomocy, nie wahaj się <a>skontaktować z nami</a>.',
  hooks_other:
    'Osiągnięto limit {{count, number}} webhooków w planie <planName/>. Ulepsz plan, aby tworzyć więcej webhooków. Jeśli potrzebujesz pomocy, nie wahaj się <a>skontaktować z nami</a>.',
  mfa: 'Odblokuj MFA, aby zweryfikować bezpieczeństwo, przechodząc na płatny plan. Nie wahaj się <a>skontaktować z nami</a>, jeśli potrzebujesz pomocy.',
  organizations:
    'Odblokuj organizacje, ulepszając do płatnego planu. Nie wahaj się <a>skontaktować z nami</a>, jeśli potrzebujesz pomocy.',
  third_party_apps:
    'Odblokuj Logto jako IdP dla aplikacji stron trzecich, ulepszając do płatnego planu. W razie potrzeby pomocy, proszę <a>skontaktuj się z nami</a>.',
  sso_connectors:
    'Odblokuj logowanie jednokrotne dla przedsiębiorstw, ulepszając do płatnego planu. W razie potrzeby pomocy, proszę <a>skontaktuj się z nami</a>.',
  tenant_members:
    'Odblokuj funkcję współpracy, ulepszając do płatnego planu. W razie potrzeby pomocy, proszę <a>skontaktuj się z nami</a>.',
  tenant_members_dev_plan:
    'Osiągnąłeś limit {{limit}} członków. Zwolnij członka lub anuluj oczekiwanie na zaproszenie, aby dodać nowego. Potrzebujesz więcej miejsc? Proszę skontaktować się z nami.',
  custom_jwt: {
    title: 'Dodaj niestandardowe twierdzenia',
    description:
      'Ulepsz do płatnego planu, aby uzyskać funkcjonalność niestandardowego JWT i korzyści premium. Jeśli masz jakieś pytania, nie wahaj się <a>skontaktować z nami</a>.',
  },
  bring_your_ui:
    'Ulepsz do płatnego planu, aby uzyskać funkcję własnego interfejsu użytkownika i korzyści premium.',
  security_features:
    'Odblokuj zaawansowane funkcje bezpieczeństwa, ulepszając do planu Pro. Nie wahaj się <a>skontaktować z nami</a>, jeśli masz jakieś pytania.',
  collect_user_profile:
    'Ulepsz do płatnego planu, aby zbierać dodatkowe informacje o profilu użytkownika podczas rejestracji. Nie wahaj się <a>skontaktować z nami</a>, jeśli masz jakieś pytania.',
};

export default Object.freeze(paywall);
