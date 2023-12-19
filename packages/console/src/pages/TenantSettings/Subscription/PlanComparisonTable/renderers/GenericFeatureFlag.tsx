import { cond } from '@silverhand/essentials';
import { type TFuncKey } from 'i18next';

import Success from '@/assets/icons/success.svg';
import DynamicT from '@/ds-components/DynamicT';

import QuotaValueWrapper from './QuotaValueWrapper';

type Props = {
  isEnabled?: boolean;
  isBeta?: boolean;
  tipPhraseKey?: TFuncKey<'translation', 'admin_console.subscription.quota_table'>;
  paymentType?: 'add-on' | 'usage';
};

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
