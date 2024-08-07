import quota_item from './quota-item.js';
import quota_table from './quota-table.js';
import usage from './usage.js';

const subscription = {
  free_plan: 'Free plan',
  free_plan_description: 'For side projects and initial Logto trials. No credit card.',
  pro_plan: 'Pro plan',
  pro_plan_description: 'For businesses benefit worry-free with Logto.',
  enterprise: 'Enterprise',
  current_plan: 'Current plan',
  current_plan_description:
    'Here’s your current plan. You can easily see your plan usage, check your upcoming bill, and make changes to your plan as needed.',
  plan_usage: 'Plan usage',
  plan_cycle: 'Plan cycle: {{period}}. Usage renews on {{renewDate}}.',
  next_bill: 'Your next bill',
  next_bill_hint: 'To learn more about the calculation, please refer to this <a>article</a>.',
  next_bill_tip:
    'The prices displayed here are tax-exclusive. The tax amount will be calculated based on the information you provide and your local regulatory requirements, and will be shown in your invoices.',
  manage_payment: 'Manage payment',
  overfill_quota_warning:
    'You have reached your quota limit. To prevent any issues, upgrade the plan.',
  upgrade_pro: 'Upgrade pro',
  update_payment: 'Update payment',
  payment_error:
    'Payment issue detected. Unable to process ${{price, number}} for previous cycle. Update payment to avoid Logto service suspension.',
  downgrade: 'Downgrade',
  current: 'Current',
  upgrade: 'Upgrade',
  quota_table,
  billing_history: {
    invoice_column: 'Invoices',
    status_column: 'Status',
    amount_column: 'Amount',
    invoice_created_date_column: 'Invoice created date',
    invoice_status: {
      void: 'Canceled',
      paid: 'Paid',
      open: 'Open',
      uncollectible: 'Overdue',
    },
  },
  quota_item,
  downgrade_modal: {
    title: 'Are you sure you want to downgrade?',
    description:
      'If you choose to switch to the <targetName/>, please note that you will no longer have access to the quota and features that were previously in <currentName/>.',
    before: 'Before: <name/>',
    after: 'After: <name />',
    downgrade: 'Downgrade',
  },
  not_eligible_modal: {
    downgrade_title: 'You are not eligible for downgrade',
    downgrade_description:
      'Make sure you meet the following criteria before downgrading to the <name/>.',
    downgrade_help_tip: 'Need help downgrading? <a>Contact us</a>.',
    upgrade_title: 'Friendly reminder for our honoured early adopters',
    upgrade_description:
      'You’re currently using more than what the <name /> allows. Logto is now official, including features tailored to each plan. Before you consider upgrading to the <name />, make sure you meet the following criteria before upgrading.',
    upgrade_pro_tip: ' Or considering upgrading to Pro plan.',
    upgrade_help_tip: 'Need help upgrading? <a>Contact us</a>.',
    a_maximum_of: 'A maximum of <item/>',
  },
  upgrade_success: 'Successfully upgraded to <name/>',
  downgrade_success: 'Successfully downgraded to <name/>',
  subscription_check_timeout: 'Subscription check timed out. Please refresh later.',
  no_subscription: 'No subscription',
  usage,
};

export default Object.freeze(subscription);
