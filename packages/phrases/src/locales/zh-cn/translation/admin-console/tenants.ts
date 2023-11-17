const tenants = {
  title: '设置',
  description: '高效管理租户设置并自定义您的域名。',
  tabs: {
    settings: '设置',
    domains: '域名管理',
    subscription: '套餐与计费',
    billing_history: '历史账单',
  },
  settings: {
    title: '设置',
    description: '设置租户名称并查看托管数据的地区和环境标签。',
    tenant_id: '租户 ID',
    tenant_name: '租户名称',
    tenant_region: '数据托管地区',
    tenant_region_tip: '您的租户资源托管在 {{region}}。 <a>了解更多</a>',
    environment_tag: '环境标签',
    environment_tag_description: '标签不会改变服务。它们只是指导您区分不同的环境。',
    environment_tag_development: '开发',
    environment_tag_staging: '预发布',
    environment_tag_production: '产品',
    development_description:
      '开发环境主要用于测试，包括所有专业功能，但在登录体验中会有水印。 <a>了解更多</a>',
    tenant_info_saved: '租户信息成功保存。',
  },
  full_env_tag: {
    development: '开发',
    production: '产品',
  },
  deletion_card: {
    title: '删除',
    tenant_deletion: '删除租户',
    tenant_deletion_description: '删除租户将导致永久删除所有相关的用户数据和配置。请谨慎操作。',
    tenant_deletion_button: '删除租户',
  },
  create_modal: {
    title: '创建租户',
    subtitle_deprecated: '创建新的租户以分隔资源和用户。',
    subtitle: '创建一个具有隔离资源和用户的新租户。数据托管的区域和租户类型在创建后无法修改。',
    tenant_usage_purpose: '您想要使用此租户做什么?',
    /** UNTRANSLATED */
    development_description:
      "For testing only and shouldn't be used in production. No subscription is required.",
    /** UNTRANSLATED */
    development_hint: 'It has all the pro features but has limitations like a sign-in banner.',
    /** UNTRANSLATED */
    production_description: 'For use by end-users and may require a paid subscription.',
    available_plan: '可用方案：',
    create_button: '创建租户',
    tenant_name_placeholder: '我的租户',
  },
  notification: {
    allow_pro_features_title: '您现在可以在您的开发租户中访问 <span>全部Logto Pro功能</span>！',
    allow_pro_features_description: '完全免费，没有试用期-永远！',
    explore_all_features: '探索所有功能',
    impact_title: '这对我有影响吗？',
    staging_env_hint:
      '您的租户标签已从"<strong>预发布</strong>"更改为"<strong>产品</strong>"，但此更改不会影响您当前的设置。',
    paid_tenant_hint_1:
      '当您订阅Logto Hobby计划时，您以前的"<strong>开发</strong>"租户标签将变更为"<strong>产品</strong>"，这不会影响您的现有设置。',
    paid_tenant_hint_2: '如果您仍处于开发阶段，您可以创建一个新的开发租户以访问更多专业功能。',
    paid_tenant_hint_3:
      '如果您处于生产阶段或生产环境中，您仍然需要订阅特定的计划，因此此时不需要进行任何操作。',
    paid_tenant_hint_4: '如需帮助，请随时联系我们！感谢您选择Logto！',
  },
  delete_modal: {
    title: '删除租户',
    description_line1:
      '您确定要删除 "<span>{{name}}</span>" 的环境标识符为"<span>{{tag}}</span>"的租户吗？ 此操作无法撤消，并将导致永久删除所有数据和帐户信息。',
    description_line2:
      '在删除帐户之前，也许我们可以帮助您。<span><a>通过电子邮件联系我们</a></span>',
    description_line3: '如果你想继续，请输入租户名 "<span>{{name}}</span>" 确认。',
    delete_button: '永久删除',
    cannot_delete_title: '无法删除此租户',
    cannot_delete_description:
      '抱歉，您现在无法删除此租户。请确保您处于免费计划并已支付所有未结账单。',
  },
  tenant_landing_page: {
    title: '您还没有创建租户',
    description:
      '要开始使用Logto配置项目，请创建一个新的租户。如果您需要注销或删除您的帐户，只需单击右上角的头像按钮。',
    create_tenant_button: '创建租户',
  },
  status: {
    mau_exceeded: '超出 MAU 限制',
    suspended: '已暂停',
    overdue: '逾期',
  },
  tenant_suspended_page: {
    title: '租户已暂停，请联系我们以恢复访问。',
    description_1:
      '我们非常遗憾地通知您，由于不当使用，包括超出MAU限制、逾期付款或其他未经授权的操作，您的租户帐户已被临时停用。',
    description_2:
      '如果您需要进一步澄清、有任何疑虑或希望恢复全部功能并解锁您的租户，请立即联系我们。',
  },
  signing_keys: {
    title: '签名密钥',
    description: '在您的租户中安全管理签名密钥。',
    type: {
      private_key: 'OIDC私钥',
      cookie_key: 'OIDC Cookie密钥',
    },
    private_keys_in_use: '正在使用的私钥',
    cookie_keys_in_use: '正在使用的 Cookie 密钥',
    rotate_private_keys: '旋转私钥',
    rotate_cookie_keys: '旋转 Cookie 密钥',
    rotate_private_keys_description:
      '此操作将创建一个新的私钥，旋转当前密钥，并删除之前的密钥。使用当前密钥签名的JWT令牌将在删除或另一轮旋转之前保持有效。',
    rotate_cookie_keys_description:
      '此操作将创建一个新的Cookie密钥，旋转当前密钥，并删除之前的密钥。使用当前密钥签名的Cookie将在删除或另一轮旋转之前保持有效。',
    select_private_key_algorithm: '为新的私钥选择签名密钥算法',
    rotate_button: '旋转',
    table_column: {
      id: 'ID',
      status: '状态',
      algorithm: '签名密钥算法',
    },
    status: {
      current: '当前',
      previous: '之前',
    },
    reminder: {
      rotate_private_key:
        '您确定要旋转<strong>OIDC私钥</strong>吗？新发布的JWT令牌将由新密钥签名。使用当前密钥签名的现有JWT令牌将在您再次旋转之前保持有效。',
      rotate_cookie_key:
        '您确定要旋转<strong>OIDC Cookie密钥</strong>吗？登录会话生成的新Cookie将由新Cookie密钥签名。使用当前密钥签名的现有Cookie将在您再次旋转之前保持有效。',
      delete_private_key:
        '您确定要删除<strong>OIDC私钥</strong>吗？使用此私有签名密钥签名的现有JWT令牌将不再有效。',
      delete_cookie_key:
        '您确定要删除<strong>OIDC Cookie密钥</strong>吗？用此Cookie密钥签名的旧登录会话将不再有效。这些用户需要重新验证。',
    },
    messages: {
      rotate_key_success: '签名密钥旋转成功。',
      delete_key_success: '密钥已成功删除。',
    },
  },
};

export default Object.freeze(tenants);
