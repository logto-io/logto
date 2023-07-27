import quota_item from './quota-item.js';
import quota_table from './quota-table.js';

const subscription = {
  free_plan: 'Free Plan',
  free_plan_description: 'For side projects and initial Logto trials. No credit card.',
  hobby_plan: 'Hobby Plan',
  hobby_plan_description: 'For individual developers or development environments.',
  pro_plan: 'Pro Plan',
  pro_plan_description: 'For businesses benefit worry-free with Logto.',
  enterprise: 'Enterprise',
  current_plan: 'Current Plan',
  current_plan_description:
    'Here’s your current plan. You can easily see your plan usage, check your upcoming bill, and make changes to your plan as needed.',
  plan_usage: 'Plan usage',
  plan_cycle: 'Plan cycle: {{period}}. Usage renews on {{renewDate}}.',
  next_bill: 'Your next bill',
  next_bill_hint: 'To learn more about the calculation, please refer to this <a>article</a>.',
  next_bill_tip:
    'Your upcoming bill includes the base price of your plan for the next month, as well as the cost of your usage multiplied by the MAU unit price in various tiers.',
  manage_payment: 'Manage payment',
  overfill_quota_warning:
    'You have reached your quota limit. To prevent any issues, upgrade the plan.',
  upgrade_pro: 'Upgrade Pro',
  update_payment: 'Update payment',
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    'Payment issue detected. Unable to process ${{price, number}} for previous cycle. Update payment to avoid Logto service suspension.',
  downgrade: 'Downgrade',
  current: 'Current',
  buy_now: 'Buy now',
  contact_us: 'Contact us',
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
    upgrade_title: 'You are not eligible for upgrade',
    upgrade_description:
      'You’re currently using more than what the <name /> allows. Before you consider upgrading to the <name />, make sure you meet the following criteria before upgrading.',
    upgrade_help_tip: 'Need help upgrading? <a>Contact us</a>.',
    a_maximum_of: 'A maximum of <item/>',
  },
  upgrade_success: 'Successfully upgraded to <name/>',
  downgrade_success: 'Successfully downgraded to <name/>',
  subscription_check_timeout: 'Subscription check timed out. Please refresh later.',
};

export default subscription;
