const applications = {
  page_title: '全部应用',
  title: '全部应用',
  subtitle: '创建一个移动、单页、machine-to-machine 或传统 web 应用程序，并通过 Logto 进行身份验证',
  subtitle_with_app_type: '为你的 {{name}} 应用程序设置 Logto 身份验证',
  create: '创建应用',
  create_third_party: '创建第三方应用',
  create_thrid_party_modal_title: '创建第三方应用（{{type}}）',
  application_name: '应用名称',
  application_name_placeholder: '我的应用',
  application_description: '应用描述',
  application_description_placeholder: '请输入应用描述',
  select_application_type: '选择应用类型',
  no_application_type_selected: '你还没有选择应用类型',
  application_created: '创建应用成功。',
  tab: {
    my_applications: '我的应用',
    third_party_applications: '第三方应用',
  },
  app_id: 'App ID',
  type: {
    native: {
      title: '原生应用',
      subtitle: '在原生环境中运行的应用程序',
      description: '例如 iOS 应用程序，Android 应用程序',
    },
    spa: {
      title: '单页应用',
      subtitle: '在浏览器中运行并动态更新数据的应用程序',
      description: '例如 React DOM 应用程序，Vue 应用程序',
    },
    traditional: {
      title: '传统网页应用',
      subtitle: '仅由 Web 服务器渲染和更新的应用程序',
      description: '例如 Next.js, PHP',
    },
    machine_to_machine: {
      title: '机器对机器',
      subtitle: '直接与资源对话的应用程序（通常是服务）',
      description: '例如后端服务',
    },
    protected: {
      title: '受保护的应用',
      subtitle: '受 Logto 保护的应用程序',
      description: 'N/A',
    },
    saml: {
      title: 'SAML 应用',
      subtitle: '用作 SAML IdP 连接器的应用程序',
      description: '例如，SAML',
    },
    third_party: {
      title: '第三方应用',
      subtitle: '用作第三方 IdP 连接器的应用程序',
      description: '例如，OIDC，SAML',
    },
  },
  placeholder_title: '选择应用程序类型以继续',
  placeholder_description:
    'Logto 使用 OIDC 的应用程序实体来帮助识别你的应用程序、管理登录和创建审计日志等任务。',
  third_party_application_placeholder_description:
    '使用 Logto 作为身份提供者为第三方服务提供 OAuth 授权。\n 包括资源访问的预建用户同意屏幕。<a>了解更多</a>',
  guide: {
    third_party: {
      title: '集成第三方应用',
      description:
        '使用 Logto 作为身份提供者为第三方服务提供 OAuth 授权。包含用于安全资源访问的预建用户同意屏幕。<a>了解更多</a>',
    },
  },
};

export default Object.freeze(applications);
