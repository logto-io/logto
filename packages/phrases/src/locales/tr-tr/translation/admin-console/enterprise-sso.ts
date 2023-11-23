const enterprise_sso = {
  page_title: 'Kurumsal SSO',
  title: 'Kurumsal SSO',
  subtitle:
    'Kurumsal kimlik sağlayıcısını bağlayın ve SP başlatmalı Tek Oturum Açmayı etkinleştirin.',
  create: 'Kurumsal bağlayıcı ekle',
  col_connector_name: 'Bağlayıcı adı',
  col_type: 'Tür',
  col_email_domain: 'E-posta etki alanı',
  col_status: 'Durum',
  col_status_in_use: 'Kullanılıyor',
  col_status_invalid: 'Geçersiz',
  placeholder_title: 'Kurumsal bağlayıcı',
  placeholder_description:
    'Logto, birçok yerleşik kurumsal kimlik sağlayıcı sunmuştur, aynı zamanda standart protokollerle kendi kimlik sağlayıcınızı oluşturabilirsiniz.',
  create_modal: {
    title: 'Kurumsal bağlayıcı ekle',
    text_divider: 'Ya da standart bir protokol ile bağlayıcınızı özelleştirebilirsiniz.',
    connector_name_field_title: 'Bağlayıcı adı',
    connector_name_field_placeholder: 'Kurumsal kimlik sağlayıcı için isim',
    create_button_text: 'Bağlayıcı Oluştur',
  },
  guide: {
    subtitle: 'Kurumsal kimlik sağlayıcısını bağlamak için adım adım rehber',
    finish_button_text: 'Devam',
  },
  basic_info: {
    title: "İdP'nizde hizmetinizi yapılandırın",
    description:
      '{{name}} kimlik sağlayıcınızda SAML 2.0 ile yeni bir uygulama entegrasyonunu oluşturun. Daha sonra aşağıdaki değeri yapıştırın.',
    saml: {
      acs_url_field_name: "Assertion tüketici hizmet URL'si (Cevap URL'si)",
      audience_uri_field_name: "Hedef URI'si (SP Varlık ID'si)",
    },
    oidc: {
      redirect_uri_field_name: "Yönlendirme URI'si (Geri çağrı URL'si)",
    },
  },
  attribute_mapping: {
    title: 'Özellik eşlemeleri',
    description:
      "`id` ve `email` kullanıcı profilini IdP'den eşitlenmelidir. IdP'nizde aşağıdaki iddianame adı ve değerini giriniz.",
    col_sp_claims: "Logto'nun İddianame Adı",
    col_idp_claims: 'Kimlik sağlayıcının iddianame adı',
    idp_claim_tooltip: 'Kimlik sağlayıcının iddianame adı',
  },
  metadata: {
    title: 'İdP metadatasını yapılandırın',
    description: 'Kimlik sağlayıcıdan metadatasını yapılandırın',
    dropdown_trigger_text: 'Başka bir yapılandırma yöntemi kullan',
    dropdown_title: 'yapılandırma yönteminizi seçin',
    metadata_format_url: "Metadatası URL'sini girin",
    metadata_format_xml: 'Metadatası XML dosyasını yükle',
    metadata_format_manual: 'Metadatayı el ile girin',
    saml: {
      metadata_url_field_name: "Metadatası URL'si",
      metadata_url_description:
        "Verileri dinamik olarak metadatası URL'si'ndan alın ve sertifikayı güncel tutun.",
      metadata_xml_field_name: 'Metadatası XML dosyası',
      metadata_xml_uploader_text: 'Metadatası XML dosyasını yükle',
      sign_in_endpoint_field_name: "Oturum açma URL'si",
      idp_entity_id_field_name: "IdP varlık ID'si (İhraççı)",
      certificate_field_name: 'İmza sertifikası',
      certificate_placeholder: 'x509 sertifikasını kopyalayıp yapıştırın',
    },
    oidc: {
      client_id_field_name: "Müşteri ID'si",
      client_secret_field_name: 'Müşteri sırrı',
      issuer_field_name: 'İhraççı',
      scope_field_name: 'Kapsam',
    },
  },
};

export default Object.freeze(enterprise_sso);
