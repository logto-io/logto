import { type Nullable } from '@silverhand/essentials';

/**
 * The tax-exclusive amount of an upcoming invoice, after invoice-level discounts. Stripe leaves
 * `totalExcludingTax` empty when it cannot compute it; `subtotal` is the closest fallback.
 */
export const getUpcomingBillAmount = (
  upcomingInvoice: Nullable<{ subtotal: number; totalExcludingTax: Nullable<number> }> | undefined
) => upcomingInvoice?.totalExcludingTax ?? upcomingInvoice?.subtotal;
