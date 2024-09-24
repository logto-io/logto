import quota_item from './quota-item.js';
import quota_table from './quota-table.js';
import usage from './usage.js';

const subscription = {
  free_plan: '免费计划',
  free_plan_description: '适用于边项目和初始 Logto 试用，无需信用卡。',
  pro_plan: '专业计划',
  pro_plan_description: '适用于企业付费无忧。',
  enterprise: '企业计划',
  /** UNTRANSLATED */
  enterprise_description: 'For large teams and businesses with enterprise-grade requirements.',
  admin_plan: '管理员计划',
  dev_plan: '开发计划',
  current_plan: '当前计划',
  current_plan_description:
    '以下是您当前的计划。您可以轻松查看计划使用情况，检查即将到来的账单，并根据需要对计划进行更改。',
  plan_usage: '计划使用情况',
  plan_cycle: '计划周期：{{period}}，使用情况将于{{renewDate}}续订。',
  next_bill: '你即将到来的账单',
  next_bill_hint: '要了解有关计算的更多信息，请参阅此<a>文章</a>。',
  next_bill_tip:
    '此处显示的价格不含税，更新可能会有轻微延迟。税额将基于您提供的信息和当地法规要求计算，并将在您的发票中显示。',
  manage_payment: '管理付款',
  overfill_quota_warning: '您已达到配额限制。为防止任何问题，请升级计划。',
  upgrade_pro: '升级专业计划',
  update_payment: '更新付款信息',
  payment_error:
    '检测到付款问题。无法处理前一周期的{{price, number}}美元。更新付款以避免 Logto 服务中断。',
  downgrade: '降级',
  current: '当前',
  upgrade: '升级',
  quota_table,
  billing_history: {
    invoice_column: '发票',
    status_column: '状态',
    amount_column: '金额',
    invoice_created_date_column: '发票创建日期',
    invoice_status: {
      void: '已取消',
      paid: '已支付',
      open: '未完成',
      uncollectible: '逾期未付',
    },
  },
  quota_item,
  downgrade_modal: {
    title: '确认要降级吗？',
    description:
      '如果您选择切换到 <targetName/>，请注意您将不再可以使用以前在 <currentName/> 中的配额和功能。',
    before: '之前：<name/>',
    after: '之后：<name />',
    downgrade: '降级',
  },
  not_eligible_modal: {
    downgrade_title: '您不符合降级条件',
    downgrade_description: '降级到<name/>前，请确保满足以下条件。',
    downgrade_help_tip: '需要降级帮助？<a>联系我们</a>。',
    upgrade_title: '致尊敬的早期采用者的友善提醒',
    upgrade_description:
      '您当前的使用量超过了 <name /> 允许的范围。Logto 现已正式发布，包括针对每个计划量身定制的功能。在考虑升级到 <name /> 之前，请确保您满足以下升级条件。',
    upgrade_pro_tip: ' 或者考虑升级到专业版计划。',
    upgrade_help_tip: '需要升级帮助？<a>联系我们</a>。',
    a_maximum_of: '最多<item/>',
  },
  upgrade_success: '成功升级到 <name/>',
  downgrade_success: '成功降级到 <name/>',
  subscription_check_timeout: '订阅检查超时，请稍后刷新。',
  no_subscription: '无订阅',
  usage,
};

export default Object.freeze(subscription);
