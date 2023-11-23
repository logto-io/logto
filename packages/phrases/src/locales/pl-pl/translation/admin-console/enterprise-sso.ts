const enterprise_sso = {
  page_title: 'Jednolite logowanie dla przedsiębiorstw',
  title: 'Jednolite logowanie dla przedsiębiorstw',
  subtitle:
    'Połącz dostawcę tożsamości przedsiębiorstwa i włącz jednostronne logowanie jednolitego.',
  create: 'Dodaj łącznik przedsiębiorstwa',
  col_connector_name: 'Nazwa łącznika',
  col_type: 'Typ',
  col_email_domain: 'Domena e-mail',
  col_status: 'Status',
  col_status_in_use: 'W użyciu',
  col_status_invalid: 'Nieprawidłowy',
  placeholder_title: 'Łącznik przedsiębiorstwa',
  placeholder_description:
    'Logto udostępniło wiele wbudowanych dostawców tożsamości przedsiębiorstw, możesz także stworzyć własnego zgodnego ze standardowymi protokołami.',
  create_modal: {
    title: 'Dodaj łącznik przedsiębiorstwa',
    text_divider: 'Albo możesz dostosować swój łącznik za pomocą standardowego protokołu.',
    connector_name_field_title: 'Nazwa łącznika',
    connector_name_field_placeholder: 'Nazwa dostawcy tożsamości przedsiębiorstwa',
    create_button_text: 'Stwórz łącznik',
  },
  guide: {
    subtitle: 'Przewodnik krok po kroku w celu połączenia dostawcy tożsamości przedsiębiorstwa.',
    finish_button_text: 'Kontynuuj',
  },
  basic_info: {
    title: 'Skonfiguruj swoją usługę w IdP',
    description:
      'Utwórz nową integrację aplikacji za pomocą SAML 2.0 w dostawcy tożsamości {{name}}. Następnie wklej następującą wartość.',
    saml: {
      acs_url_field_name: 'Adres URL usługi konsumenta asercji (Reply URL)',
      audience_uri_field_name: 'URI odbiorcy (SP Entity ID)',
    },
    oidc: {
      redirect_uri_field_name: 'Adres URL przekierowania (Callback URL)',
    },
  },
  attribute_mapping: {
    title: 'Mapowanie atrybutów',
    description:
      '`id` oraz `email` są wymagane do synchronizacji profilu użytkownika z IdP. Wprowadź następującą nazwę i wartość atrybutu w swoim IdP.',
    col_sp_claims: 'Nazwa atrybutu Logto',
    col_idp_claims: 'Nazwa atrybutu dostawcy tożsamości',
    idp_claim_tooltip: 'Nazwa atrybutu dostawcy tożsamości',
  },
  metadata: {
    title: 'Skonfiguruj metadane IdP',
    description: 'Skonfiguruj metadane dostawcy tożsamości',
    dropdown_trigger_text: 'Wybierz inny sposób konfiguracji',
    dropdown_title: 'wybierz swoją metodę konfiguracji',
    metadata_format_url: 'Wprowadź adres URL metadanych',
    metadata_format_xml: 'Prześlij plik XML metadanych',
    metadata_format_manual: 'Ręcznie wprowadź szczegóły metadanych',
    saml: {
      metadata_url_field_name: 'Adres URL metadanych',
      metadata_url_description:
        'Dynamicznie pobieraj dane z adresu URL metadanych i aktualizuj certyfikat.',
      metadata_xml_field_name: 'Plik XML metadanych',
      metadata_xml_uploader_text: 'Prześlij plik XML metadanych',
      sign_in_endpoint_field_name: 'Adres URL logowania',
      idp_entity_id_field_name: 'Identyfikator jednostki IdP (Wydawca)',
      certificate_field_name: 'Certyfikat podpisywania',
      certificate_placeholder: 'Skopiuj i wklej certyfikat x509',
    },
    oidc: {
      client_id_field_name: 'Identyfikator klienta',
      client_secret_field_name: 'Tajny klucz klienta',
      issuer_field_name: 'Wydawca',
      scope_field_name: 'Zakres',
    },
  },
};

export default Object.freeze(enterprise_sso);
