const verification_code = {
  phone_email_empty: 'Sowohl Telefon als auch E-Mail sind leer.',
  not_found: 'Bestätigungscode nicht gefunden. Bitte senden Sie zuerst den Bestätigungscode.',
  phone_mismatch:
    'Telefonnummer stimmt nicht überein. Bitte fordern Sie einen neuen Bestätigungscode an.',
  email_mismatch: 'E-Mail stimmt nicht überein. Bitte fordern Sie einen neuen Bestätigungscode an.',
  code_mismatch: 'Ungültiger Bestätigungscode.',
  expired: 'Bestätigungscode ist abgelaufen. Bitte fordern Sie einen neuen Bestätigungscode an.',
  exceed_max_try:
    'Die Begrenzung für die Anzahl der Bestätigungscode-Wiederholungen wurde überschritten. Bitte fordern Sie einen neuen Bestätigungscode an.',
};

export default verification_code;
