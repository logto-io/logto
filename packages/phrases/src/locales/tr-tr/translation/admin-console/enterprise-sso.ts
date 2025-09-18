const enterprise_sso = {
  page_title: 'Kurumsal SSO',
  title: 'Kurumsal SSO',
  subtitle: 'Kurumsal kimlik sağlayıcısını bağlayın ve Tek Oturum Açmayı etkinleştirin.',
  create: 'Kurumsal bağlayıcı ekle',
  col_connector_name: 'Bağlayıcı adı',
  col_type: 'Tür',
  col_email_domain: 'E-posta etki alanı',
  placeholder_title: 'Kurumsal bağlayıcı',
  placeholder_description:
    'Logto, birçok yerleşik kurumsal kimlik sağlayıcı sağlamıştır, aynı zamanda SAML ve OIDC protokolleri ile kendi sahip olduğunuzu oluşturabilirsiniz.',
  create_modal: {
    title: 'Kurumsal bağlayıcı ekle',
    text_divider: 'Ya da standart bir protokol ile bağlayıcınızı özelleştirebilirsiniz.',
    connector_name_field_title: 'Bağlayıcı adı',
    connector_name_field_placeholder: 'Ör., {şirket adı} - {kimlik sağlayıcı adı}',
    create_button_text: 'Bağlayıcı Oluştur',
  },
  guide: {
    subtitle: 'Kurumsal kimlik sağlayıcıyı bağlamak için adım adım kılavuz.',
    finish_button_text: 'Devam',
  },
  basic_info: {
    title: "İdP'de hizmetinizi yapılandırın",
    description:
      'Yeni bir uygulama entegrasyonu oluşturun, {{name}} kimlik sağlayıcınızda SAML 2.0 ile. Ardından aşağıdaki değeri yapıştırın.',
    saml: {
      acs_url_field_name: 'Assertion consumer service URL (Reply URL)',
      audience_uri_field_name: "Kitle URI'si (SP Varlık ID'si)",
      entity_id_field_name: "Hizmet Sağlayıcı (SP) Varlık ID'si",
      entity_id_field_tooltip:
        "SP Varlık ID'si herhangi bir dize formatında olabilir, tipik olarak bir URI veya URL formunda bir tanımlayıcı olarak kullanılır, ancak bu zorunlu değildir.",
      acs_url_field_placeholder: 'https://your-domain.com/api/saml/callback',
      entity_id_field_placeholder: 'urn:your-domain.com:sp:saml:{serviceProviderId}',
    },
    oidc: {
      redirect_uri_field_name: "Yönlendirme URI'si (Geri çağrı URL'si)",
      redirect_uri_field_description:
        "Yeniden yönlendirme URI'si, SSO kimlik doğrulamasından sonra kullanıcıların yönlendirildiği yerdir. Bu URI'yi IdP yapılandırmanıza ekleyin.",
      redirect_uri_field_custom_domain_description:
        "Logto'da birden fazla <a>özel alan adı</a> kullanıyorsanız, SSO'nun her alan adında çalışması için ilgili tüm geri dönüş URI'lerini IdP'nize eklediğinizden emin olun.\n\nVarsayılan Logto alan adı (*.logto.app) her zaman geçerlidir; yalnızca o alan adı altında SSO'yu desteklemek istiyorsanız ekleyin.",
    },
  },
  attribute_mapping: {
    title: 'Özellik eşlemeleri',
    description:
      "`id` ve `email`, kullanıcı profilini IdP'den senkronize etmek için gereklidir. IdP'nizde aşağıdaki talep adı ve değeri girin.",
    col_sp_claims: 'Hizmet sağlayıcı değeri (Logto)',
    col_idp_claims: 'Kimlik sağlayıcı talep adı',
    idp_claim_tooltip: 'Kimlik sağlayıcı talep adı',
  },
  metadata: {
    title: 'İdP metadatasını yapılandırın',
    description: 'Kimlik sağlayıcıdan metadatasını yapılandırın',
    dropdown_trigger_text: 'Başka bir yapılandırma yöntemi kullan',
    dropdown_title: 'Yapılandırma yönteminizi seçin',
    metadata_format_url: "Metadatası URL'sini girin",
    metadata_format_xml: 'Metadatası XML dosyasını yükleyin',
    metadata_format_manual: 'Metadatayı manuel olarak girin',
    saml: {
      metadata_url_field_name: "Metadatası URL'si",
      metadata_url_description:
        "Metadatası URL'den verileri dinamik olarak alın ve sertifikayı güncel tutun.",
      metadata_xml_field_name: 'IdP metadatası XML dosyası',
      metadata_xml_uploader_text: 'Metadatası XML dosyasını yükle',
      sign_in_endpoint_field_name: "Giriş URL'si",
      idp_entity_id_field_name: 'IdP varlık kimliği (Yayıncı)',
      certificate_field_name: 'İmza sertifikası',
      certificate_placeholder: 'x509 sertifikasını kopyalayıp yapıştırın',
      certificate_required: 'İmza sertifikası gerekli.',
    },
    oidc: {
      client_id_field_name: 'Müşteri kimliği',
      client_secret_field_name: 'Müşteri parolası',
      issuer_field_name: 'Yayıncı',
      scope_field_name: 'Kapsam',
      scope_field_placeholder: 'Kapsamları girin (bir boşluk ile ayrılmış)',
    },
  },
};

export default Object.freeze(enterprise_sso);
