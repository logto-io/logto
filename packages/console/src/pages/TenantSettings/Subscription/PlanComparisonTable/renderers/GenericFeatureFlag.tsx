import { cond } from '@silverhand/essentials';
import { type TFuncKey } from 'i18next';

import Success from '@/assets/icons/success.svg';
import DynamicT from '@/ds-components/DynamicT';

import QuotaValueWrapper from './QuotaValueWrapper';

type Props = {
  /**
   * Whether the feature is enabled.
   * If `undefined`, it means that the feature quota is not determined yet, will display 'Contact us' and other props will be ignored.
   */
  isEnabled?: boolean;
  /**
   * Whether the feature is in beta.
   * Often used with the `paymentType` prop.
   * - `false`:
   *  - When `isEnabled` is `true`, it will display a checkmark.
   *  - When `isEnabled` is `false`, it will display '-'.
   * - `true`:
   *  - when the `paymentType` is `add-on` or `undefined`, it will display 'Add-on (Beta)', or it will display '-'.
   *  - when the `paymentType` is `usage`, it will display 'Beta'.
   */
  isBeta?: boolean;
  /**
   * Used with the `isBeta` prop to indicate the payment type of the feature.
   */
  paymentType?: 'add-on' | 'usage';
  /**
   * The tip phrase key to show
   */
  tipPhraseKey?: TFuncKey<'translation', 'admin_console.subscription.quota_table'>;
};

/**
 * Render a feature flag to indicate whether a feature is enabled or not in the plan comparison table.
 * - **For normal features**:
 *    - If `isEnabled` is `undefined`, it will display 'Contact us'.
 *    - If `isEnabled` is `true`, it will display a checkmark.
 * - **For beta features**:
 *    - If `isBeta` is `true` and the feature is enabled:
 *      - If `paymentType` is `add-on` or `undefined`, it will display 'Add-on (Beta)'.
 *      - If `paymentType` is `usage`, it will display 'Beta'.
 *    - If `isBeta` is `false` or the feature is disabled: works the same as normal features.
 *
 * @example
 * ```tsx
 * <GenericFeatureFlag isEnabled={true} />
 * ```
 */
function GenericFeatureFlag({ isEnabled, isBeta, tipPhraseKey, paymentType }: Props) {
  if (isEnabled === undefined) {
    return <DynamicT forKey="subscription.quota_table.contact" />;
  }

  return (
    <QuotaValueWrapper
      tip={cond(tipPhraseKey && <DynamicT forKey={`subscription.quota_table.${tipPhraseKey}`} />)}
    >
      {isEnabled
        ? cond(!isBeta && <Success />) ?? (
            <DynamicT
              forKey={
                paymentType === 'add-on'
                  ? 'subscription.quota_table.add_on_beta'
                  : 'subscription.quota_table.beta'
              }
            />
          )
        : '-'}
    </QuotaValueWrapper>
  );
}

export default GenericFeatureFlag;
