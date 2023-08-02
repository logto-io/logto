const upsell = {
  pro_tag: 'PRO',
  upgrade_plan: 'Ulepsz plan',
  compare_plans: 'Porównaj plany',
  get_started: {
    title: 'Rozpocznij swój płynny proces identyfikacji dzięki darmowemu planowi!',
    description:
      'Darmowy plan doskonale sprawdzi się do przetestowania Logto na twoich projektach czy testach. Aby w pełni wykorzystać możliwości Logto dla twojego zespołu, zaktualizuj plan i uzyskaj nieograniczony dostęp do funkcji premium: nielimitowanej liczby MAU, integracji maszynowej, zarządzania RBAC, długoterminowych dzienników audytu itd. <a>Zobacz wszystkie plany</a>',
  },
  create_tenant: {
    title: 'Wybierz swój plan najemcy',
    description:
      'Logto oferuje konkurencyjne opcje planów z innowacyjnym i przystępnym cenowo modelu dla rozwijających się firm. <a>Dowiedz się więcej</a>',
    base_price: 'Cena podstawowa',
    monthly_price: '{{value, number}}/mies.',
    mau_unit_price: 'Cena jednostkowa MAU',
    view_all_features: 'Zobacz wszystkie funkcje',
    select_plan: 'Wybierz <name/>',
    free_tenants_limit: 'Do {{count, number}} bezpłatnego najemcy',
    free_tenants_limit_other: 'Do {{count, number}} bezpłatnych najemców',
    most_popular: 'Najpopularniejszy',
    upgrade_success: 'Pomyślnie ulepszono do <name/>',
  },
  paywall: {
    applications:
      'Osiągnięto limit {{count, number}} aplikacji dla <planName/>. Zaktualizuj plan, aby sprostać potrzebom zespołu. W razie potrzeby pomocy, proszę <a>skontaktuj się z nami</a>.',
    applications_other:
      'Osiągnięto limit {{count, number}} aplikacji dla <planName/>. Zaktualizuj plan, aby sprostać potrzebom zespołu. W razie potrzeby pomocy, proszę <a>skontaktuj się z nami</a>.',
    machine_to_machine_feature:
      'Zaktualizuj plan na płatny, aby tworzyć aplikacje maszynowe i uzyskać dostęp do wszystkich funkcji premium. W razie potrzeby pomocy, proszę <a>skontaktuj się z nami</a>.',
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
      'Odblokuj funkcję niestandardowego domeny i szereg korzyści premium, ulepszając do płatnego planu. Jeśli potrzebujesz pomocy, nie wahaj się <a>skontaktować z nami</a>.',
    social_connectors:
      'Osiągnięto limit {{count, number}} konektorów społecznościowych w planie <planName/>. Aby sprostać potrzebom twojego zespołu, ulepsz plan, aby uzyskać dodatkowe konektory społecznościowe oraz możliwość tworzenia własnych konektorów za pomocą protokołów OIDC, OAuth 2.0 i SAML. Jeśli potrzebujesz pomocy, nie wahaj się <a>skontaktować z nami</a>.',
    social_connectors_other:
      'Osiągnięto limit {{count, number}} konektorów społecznościowych w planie <planName/>. Aby sprostać potrzebom twojego zespołu, ulepsz plan, aby uzyskać dodatkowe konektory społecznościowe oraz możliwość tworzenia własnych konektorów za pomocą protokołów OIDC, OAuth 2.0 i SAML. Jeśli potrzebujesz pomocy, nie wahaj się <a>skontaktować z nami</a>.',
    standard_connectors_feature:
      'Ulepsz do płatnego planu, aby tworzyć własne konektory za pomocą protokołów OIDC, OAuth 2.0 i SAML, oraz uzyskać nieograniczoną liczbę konektorów społecznościowych i wszystkie funkcje premium. Jeśli potrzebujesz pomocy, nie wahaj się <a>skontaktować z nami</a>.',
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
    scopes_per_role:
      'Osiągnięto limit {{count, number}} uprawnień na rolę w planie <planName/>. Ulepsz plan, aby dodać dodatkowe role i uprawnienia. W razie potrzeby, skontaktuj się z nami <a>tutaj</a>.',
    scopes_per_role_other:
      'Osiągnięto limit {{count, number}} uprawnień na rolę w planie <planName/>. Ulepsz plan, aby dodać dodatkowe role i uprawnienia. W razie potrzeby, skontaktuj się z nami <a>tutaj</a>.',
    hooks:
      'Osiągnięto limit {{count, number}} webhooków w planie <planName/>. Ulepsz plan, aby tworzyć więcej webhooków. Jeśli potrzebujesz pomocy, nie wahaj się <a>skontaktować z nami</a>.',
    hooks_other:
      'Osiągnięto limit {{count, number}} webhooków w planie <planName/>. Ulepsz plan, aby tworzyć więcej webhooków. Jeśli potrzebujesz pomocy, nie wahaj się <a>skontaktować z nami</a>.',
  },
  mau_exceeded_modal: {
    title: 'MAU przekroczyło limit. Ulepsz swój plan.',
    notification:
      'Obecna liczba MAU przekroczyła limit planu <planName/>. Proszę natychmiast zaktualizować swój plan na wersję premium, aby uniknąć zawieszenia usługi Logto.',
    update_plan: 'Zaktualizuj plan',
  },
  payment_overdue_modal: {
    title: 'Opłata za fakturę zaległa',
    notification:
      'Ups! Płatność za fakturę najemcy <span>{{name}}</span> nie powiodła się. Proszę zapłacić fakturę w odpowiednim terminie, aby uniknąć zawieszenia usługi Logto.',
    unpaid_bills: 'Nieuregulowane faktury',
    update_payment: 'Zaktualizuj płatność',
  },
};

export default Object.freeze(upsell);
