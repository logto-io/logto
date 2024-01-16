import { cond } from '@silverhand/essentials';
import { type TFuncKey } from 'i18next';

import Success from '@/assets/icons/success.svg';
import DynamicT from '@/ds-components/DynamicT';

import TableDataWrapper from '../components/TableDataWrapper';

type Props = {
  /**
   * Whether the feature is enabled.
   * If `undefined`, it means that the feature quota is not determined yet, will display 'Contact us' and other props will be ignored.
   */
  isEnabled?: boolean;
  /**
   * The payment type of the feature.
   */
  isAddOnForPlan?: boolean;
  /**
   * The tip phrase key to show
   */
  tipPhraseKey?: TFuncKey<'translation', 'admin_console.subscription.quota_table'>;
  customContent?: React.ReactNode;
};

/**
 * Render a feature flag to indicate whether a feature is enabled or not in the plan comparison table.
 *  - If `isEnabled` is `undefined`, it will display 'Contact us'.
 *  - If `isEnabled` is `true`, it will display a checkmark.
 *  - If `isEnabled` is `false`, it will display a dash.
 * @example
 * ```tsx
 * <GenericFeatureFlag isEnabled={true} />
 * ```
 */
function GenericFeatureFlag({
  isEnabled,
  tipPhraseKey,
  isAddOnForPlan = false,
  customContent,
}: Props) {
  if (isEnabled === undefined) {
    return <DynamicT forKey="subscription.quota_table.contact" />;
  }

  return (
    <TableDataWrapper
      tip={cond(tipPhraseKey && <DynamicT forKey={`subscription.quota_table.${tipPhraseKey}`} />)}
      extraInfo={cond(isAddOnForPlan && <DynamicT forKey="subscription.quota_table.add_on" />)}
    >
      {customContent ?? (isEnabled ? <Success /> : '-')}
    </TableDataWrapper>
  );
}

export default GenericFeatureFlag;
