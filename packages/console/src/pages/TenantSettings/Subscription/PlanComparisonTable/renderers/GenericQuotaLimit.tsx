import { cond, type Nullable } from '@silverhand/essentials';
import { type TFuncKey } from 'i18next';

import Success from '@/assets/icons/success.svg';
import DynamicT from '@/ds-components/DynamicT';

import QuotaValueWrapper from './QuotaValueWrapper';

type Props = {
  quota?: Nullable<number>;
  tipPhraseKey?: TFuncKey<'translation', 'admin_console.subscription.quota_table'>;
  tipInterpolation?: Record<string, unknown>;
  hasCheckmark?: boolean;
  formatter?: (quota: number) => string;
};

function GenericQuotaLimit({
  quota,
  tipPhraseKey,
  tipInterpolation,
  hasCheckmark,
  formatter,
}: Props) {
  if (quota === undefined) {
    return <DynamicT forKey="subscription.quota_table.contact" />;
  }

  const tipContent = cond(
    tipPhraseKey && (
      <DynamicT
        forKey={`subscription.quota_table.${tipPhraseKey}`}
        interpolation={tipInterpolation}
      />
    )
  );

  if (quota === null) {
    return (
      <QuotaValueWrapper tip={tipContent}>
        {hasCheckmark && <Success />}
        <DynamicT forKey="subscription.quota_table.unlimited" />
      </QuotaValueWrapper>
    );
  }

  return (
    <QuotaValueWrapper tip={tipContent}>
      {quota === 0 ? (
        '-'
      ) : (
        <>
          {hasCheckmark && <Success />}
          {formatter?.(quota) ?? quota.toLocaleString()}
        </>
      )}
    </QuotaValueWrapper>
  );
}

export default GenericQuotaLimit;
