const add_on = {
  mfa_inline_notification:
    'MFA to dodatek za ${{price, number}} miesięcznie do {{planName}}. Pierwszy miesiąc proporcjonalny w zależności od cyklu rozliczeniowego. <a>Dowiedz się więcej</a>',
  footer: {
    api_resource:
      'Dodatkowe zasoby kosztują <span>${{price, number}} miesięcznie / każdy</span>. Pierwszy miesiąc proporcjonalny w zależności od cyklu rozliczeniowego. <a>Dowiedz się więcej</a>',
    machine_to_machine_app:
      'Dodatkowe aplikacje typu machine-to-machine kosztują <span>${{price, number}} miesięcznie / każda</span>. Pierwszy miesiąc proporcjonalny w zależności od cyklu rozliczeniowego. <a>Dowiedz się więcej</a>',
    enterprise_sso:
      'SSO Enterprise kosztuje za <span>${{price, number}} miesięcznie / każda</span> dodatek do {{planName}}. Pierwszy miesiąc proporcjonalny w zależności od cyklu rozliczeniowego. <a>Dowiedz się więcej</a>',
    tenant_members:
      'Dodatkowi członkowie kosztują <span>${{price, number}} miesięcznie / każdy</span>. Pierwszy miesiąc proporcjonalny w zależności od cyklu rozliczeniowego. <a>Dowiedz się więcej</a>',
    organization:
      'Organizacja to dodatek za <span>${{price, number}} miesięcznie</span> do {{planName}} z nieograniczoną liczbą organizacji. Pierwszy miesiąc proporcjonalny w zależności od cyklu rozliczeniowego. <a>Dowiedz się więcej</a>',
  },
};

export default Object.freeze(add_on);
