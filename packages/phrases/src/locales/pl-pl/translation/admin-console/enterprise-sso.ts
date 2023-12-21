const enterprise_sso = {
  page_title: 'Jednolite logowanie dla przedsiębiorstw',
  title: 'Jednolite logowanie dla przedsiębiorstw',
  subtitle:
    'Połącz dostawcę tożsamości przedsiębiorstwa i włącz jednostronne logowanie jednolitego.',
  create: 'Dodaj łącznik przedsiębiorstwa',
  col_connector_name: 'Nazwa łącznika',
  col_type: 'Typ',
  col_email_domain: 'Domena e-mail',
  placeholder_title: 'Łącznik przedsiębiorstwa',
  placeholder_description:
    'Logto dostarczył wiele wbudowanych dostawców tożsamości przedsiębiorstwa do połączenia, w międzyczasie możesz także stworzyć własny za pomocą protokołów SAML i OIDC.',
  create_modal: {
    title: 'Dodaj łącznik przedsiębiorstwa',
    text_divider: 'Albo możesz dostosować swój łącznik za pomocą standardowego protokołu.',
    connector_name_field_title: 'Nazwa łącznika',
    connector_name_field_placeholder: 'Np. {nazwa firmy} - {nazwa dostawcy tożsamości}',
    create_button_text: 'Stwórz łącznik',
  },
  guide: {
    subtitle: 'Przewodnik krok po kroku dotyczący połączenia dostawcy tożsamości przedsiębiorstwa.',
    finish_button_text: 'Kontynuuj',
  },
  basic_info: {
    title: 'Skonfiguruj swoją usługę w IdP',
    description:
      'Utwórz nową integrację aplikacji za pomocą SAML 2.0 w dostawcy tożsamości {{name}}. Następnie wklej poniższą wartość.',
    saml: {
      acs_url_field_name: 'Adres URL usługi konsumenta twierdzeń (Adres URL odpowiedzi)',
      audience_uri_field_name: 'URI odbiorcy (ID podmiotu SP)',
    },
    oidc: {
      redirect_uri_field_name: 'Adres URL przekierowania (Adres URL wywołania zwrotnego)',
    },
  },
  attribute_mapping: {
    title: 'Wiązanie atrybutów',
    description:
      '`id` i `email` są wymagane do synchronizacji profilu użytkownika z IdP. Wprowadź następującą nazwę i wartość twierdzenia w swoim IdP.',
    col_sp_claims: 'Wartość dostawcy usług (Logto)',
    col_idp_claims: 'Nazwa twierdzenia dostawcy tożsamości',
    idp_claim_tooltip: 'Nazwa twierdzenia dostawcy tożsamości',
  },
  metadata: {
    title: 'Skonfiguruj metadane IdP',
    description: 'Skonfiguruj metadane z dostawcy tożsamości',
    dropdown_trigger_text: 'Użyj innej metody konfiguracji',
    dropdown_title: 'wybierz swoją metodę konfiguracji',
    metadata_format_url: 'Wprowadź adres URL metadanych',
    metadata_format_xml: 'Prześlij plik XML metadanych',
    metadata_format_manual: 'Ręcznie wprowadź szczegóły metadanych',
    saml: {
      metadata_url_field_name: 'Adres URL metadanych',
      metadata_url_description:
        'Pobierz dynamicznie dane z adresu URL metadanych i bądź na bieżąco z certyfikatem.',
      metadata_xml_field_name: 'Plik XML metadanych IdP',
      metadata_xml_uploader_text: 'Prześlij plik XML metadanych',
      sign_in_endpoint_field_name: 'Adres URL logowania',
      idp_entity_id_field_name: 'Identyfikator jednostki IdP (Wydawca)',
      certificate_field_name: 'Certyfikat podpisujący',
      certificate_placeholder: 'Skopiuj i wklej certyfikat x509',
      certificate_required: 'Certyfikat podpisujący jest wymagany.',
    },
    oidc: {
      client_id_field_name: 'ID klienta',
      client_secret_field_name: 'Tajny klucz klienta',
      issuer_field_name: 'Wydawca',
      scope_field_name: 'Zakres',
    },
  },
};

export default Object.freeze(enterprise_sso);
