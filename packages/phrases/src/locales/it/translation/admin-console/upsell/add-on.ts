const add_on = {
  mfa_inline_notification:
    'MFA è un supplemento di ${{price, number}} al mese per il {{planName}}. Il primo mese è calcolato proporzionalmente in base al tuo ciclo di fatturazione. <a>Scopri di più</a>',
  footer: {
    api_resource:
      'Le risorse aggiuntive costano <span>${{price, number}} al mese / ciascuna</span>. Il primo mese è calcolato proporzionalmente in base al tuo ciclo di fatturazione. <a>Scopri di più</a>',
    machine_to_machine_app:
      'Le app aggiuntive da macchina a macchina costano <span>${{price, number}} al mese / ciascuna</span>. Il primo mese è calcolato proporzionalmente in base al tuo ciclo di fatturazione. <a>Scopri di più</a>',
    enterprise_sso:
      'SSO aziendale è un supplemento di <span>${{price, number}} al mese / ciascuna</span> per {{planName}}. Il primo mese è calcolato proporzionalmente in base al tuo ciclo di fatturazione. <a>Scopri di più</a>',
    tenant_members:
      'I membri aggiuntivi costano <span>${{price, number}} al mese / ciascuno</span>. Il primo mese è calcolato proporzionalmente in base al tuo ciclo di fatturazione. <a>Scopri di più</a>',
    organization:
      "L'organizzazione è un supplemento di <span>${{price, number}} al mese</span> per {{planName}} con organizzazioni illimitate. Il primo mese è calcolato proporzionalmente in base al tuo ciclo di fatturazione. <a>Scopri di più</a>",
  },
};

export default Object.freeze(add_on);
