const tenants = {
  title: '设置',
  description: '高效管理租户设置并自定义您的域名。',
  tabs: {
    settings: '设置',
    members: '成员',
    domains: '域名管理',
    subscription: '套餐与计费',
    billing_history: '历史账单',
  },
  settings: {
    title: '设置',
    description: '设置租户名称并查看您的数据托管地区和租户类型。',
    tenant_id: '租户 ID',
    tenant_name: '租户名称',
    tenant_region: '数据托管地区',
    tenant_region_tip: '您的租户资源托管在 {{region}}。 <a>了解更多</a>',
    environment_tag_development: '开发',
    environment_tag_production: '产品',
    tenant_type: '租户类型',
    development_description:
      '仅用于测试，不应在生产环境中使用。不需要订阅。它具有所有专业功能，但有像登录横幅之类的限制。<a>了解更多</a>',
    production_description: '适用于由最终用户使用且可能需要付费订阅的应用程序。<a>了解更多</a>',
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
  leave_tenant_card: {
    title: '离开',
    leave_tenant: '离开租户',
    leave_tenant_description: '租户中的任何资源将保留，但您将不再能访问此租户。',
    last_admin_note: '要离开此租户，请确保至少还有一名成员具有管理员角色。',
  },
  create_modal: {
    title: '创建租户',
    subtitle: '创建一个具有隔离资源和用户的新租户。数据托管的区域和租户类型在创建后无法修改。',
    tenant_usage_purpose: '您想要使用此租户做什么?',
    development_description: '仅用于测试，不应在生产环境中使用。不需要订阅。',
    development_hint: '它具有所有专业功能，但有像登录横幅之类的限制。',
    production_description: '用于最终用户使用，可能需要付费订阅。',
    available_plan: '可用方案：',
    create_button: '创建租户',
    tenant_name_placeholder: '我的租户',
  },
  dev_tenant_migration: {
    title: '您现在可以通过创建新的“开发租户”免费尝试我们的专业功能！',
    affect_title: '这对您有什么影响?',
    hint_1:
      '我们正在用两个新的租户类型：<strong>“开发”</strong>和<strong>“产品”</strong>替换旧的<strong>环境标签</strong>。',
    hint_2:
      '为了确保顺畅过渡和功能不中断，所有早期创建的租户将被提升到<strong>产品</strong>租户类型，同时保留之前的订阅。',
    hint_3: '不用担心，您的所有其他设置将保持不变。',
    about_tenant_type: '关于租户类型',
  },
  delete_modal: {
    title: '删除租户',
    description_line1:
      '您确定要删除您的租户 "<span>{{name}}</span>" 以及环境后缀标签 "<span>{{tag}}</span>" 吗？此操作无法撤销，将永久删除您的所有数据和租户信息。',
    description_line2:
      '在删除租户之前，也许我们可以帮助您。<span><a>通过电子邮件与我们联系</a></span>',
    description_line3: '如果您确定要继续，请输入租户名称 "<span>{{name}}</span>" 确认。',
    delete_button: '永久删除',
    cannot_delete_title: '无法删除此租户',
    cannot_delete_description:
      '抱歉，您现在无法删除此租户。请确保您处于免费计划并已支付所有未结账单。',
  },
  leave_tenant_modal: {
    description: '确定要离开此租户吗?',
    leave_button: '离开',
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
};

export default Object.freeze(tenants);
