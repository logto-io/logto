const enterprise_subscription = {
  page_title: 'Abonnement',
  title: 'Verwalten Sie Ihr Abonnement',
  subtitle: 'Hier können Sie Ihr Multi-Tenant-Abonnement und den Zahlungsverlauf verwalten',
  tab: {
    subscription: 'Abonnement',
    billing_history: 'Zahlungsverlauf',
  },
  subscription: {
    title: 'Abonnement',
    description:
      'Verfolgen Sie ganz einfach Ihre Nutzung, sehen Sie Ihre nächste Rechnung und überprüfen Sie Ihren ursprünglichen Vertrag.',
    enterprise_plan_title: 'Unternehmensplan',
    enterprise_plan_description:
      'Dies ist Ihr Unternehmensplan-Abonnement und dieses Kontingent wird zwischen den Mandanten geteilt. Die Nutzung kann unter Umständen leicht verzögert aktualisiert werden. ',
    add_on_title: 'Add-ons nach Bedarf',
    add_on_description:
      'Dies sind zusätzliche Add-ons nach Bedarf basierend auf Ihrem Vertrag oder den standardmäßigen Pay-as-you-go-Sätzen von Logto. Ihnen werden Gebühren entsprechend Ihrer tatsächlichen Nutzung berechnet.',
    included: 'Inklusive',
    over_quota: 'Über dem Kontingent',
    basic_plan_column_title: {
      product: 'Produkt',
      usage: 'Nutzung',
      quota: 'Kontingent',
    },
    add_on_column_title: {
      product: 'Produkt',
      unit_price: 'Stückpreis',
      quantity: 'Menge',
      total_price: 'Gesamt',
    },
    add_on_sku_price: '${{price}}/Monat',
    private_region_title: 'Private Cloud-Instanz ({{regionName}})',
    shared_cross_tenants: 'Über Mandanten hinweg',
  },
};

export default Object.freeze(enterprise_subscription);
