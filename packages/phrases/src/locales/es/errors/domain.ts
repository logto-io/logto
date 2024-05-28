const domain = {
  not_configured: 'El proveedor de nombres de dominio del host no está configurado.',
  cloudflare_data_missing: 'cloudflare_data falta, por favor revise.',
  cloudflare_unknown_error: 'Se produjo un error desconocido al solicitar la API de Cloudflare',
  cloudflare_response_error: 'Recibió una respuesta inesperada de Cloudflare.',
  limit_to_one_domain: 'Solo puedes tener un dominio personalizado.',
  hostname_already_exists: 'Este dominio ya existe en nuestro servidor.',
  cloudflare_not_found: 'No se puede encontrar el nombre de host en Cloudflare',
  domain_is_not_allowed: 'Este dominio no está permitido.',
};

export default Object.freeze(domain);
