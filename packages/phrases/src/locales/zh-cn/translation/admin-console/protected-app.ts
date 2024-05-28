const protected_app = {
  name: '受保护的应用',
  title: '创建受保护的应用：简单快速地添加身份验证',
  description:
    '受保护的应用安全地维护用户会话并代理您的应用请求。由 Cloudflare Workers 提供支持，全球范围内享受一流性能和 0 毫秒冷启动。 <a>了解更多</a>',
  fast_create: '快速创建',
  modal_title: '创建受保护的应用',
  modal_subtitle: '点击即可启用安全且快速的保护。轻松为现有 Web 应用添加身份验证。',
  form: {
    url_field_label: '您的源 URL',
    url_field_placeholder: 'https://domain.com/',
    url_field_description: '提供需要身份验证保护的应用地址。',
    url_field_modification_notice: '对源 URL 的修改可能需要 1-2 分钟在全球网络位置生效。',
    url_field_tooltip:
      "提供您应用的地址，不包括任何 '/pathname'。创建后，您可以自定义路由身份验证规则。\n\n请注意：源 URL 本身不需要进行验证；保护仅适用于通过指定应用域名访问。",
    domain_field_label: '应用域名',
    domain_field_placeholder: 'your-domain',
    domain_field_description: '此 URL 用作原始 URL 的身份验证保护代理。创建后可申请自定义域。',
    domain_field_description_short: '此 URL 用作原始 URL 的身份验证保护代理。',
    domain_field_tooltip:
      "通过 Logto 保护的应用默认将托管在'your-domain.{{domain}}'. 创建后可申请自定义域。",
    create_application: '创建应用',
    create_protected_app: '快速创建',
    errors: {
      domain_required: '需要您的域名。',
      domain_in_use: '此子域名已被使用。',
      invalid_domain_format: "无效的子域名格式：仅使用小写字母、数字和短横线 '-'。",
      url_required: '需要源 URL。',
      invalid_url: "无效的源 URL 格式：使用 http:// 或 https://。请注意：暂不支持 '/pathname'。",
      localhost: '请首先将本地服务器暴露到互联网上。了解有关<a>本地开发</a>的更多信息。',
    },
  },
  success_message: '🎉 应用身份验证成功启用！尽情探索您网站的新体验。',
};

export default Object.freeze(protected_app);
