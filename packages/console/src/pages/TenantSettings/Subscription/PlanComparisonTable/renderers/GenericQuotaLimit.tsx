import { cond, type Nullable } from '@silverhand/essentials';
import { type TFuncKey } from 'i18next';
import { type ReactNode } from 'react';

import Success from '@/assets/icons/success.svg';
import DynamicT from '@/ds-components/DynamicT';

import TableDataWrapper from '../components/TableDataWrapper';

type Props = {
  quota?: Nullable<number>;
  tipPhraseKey?: TFuncKey<'translation', 'admin_console.subscription.quota_table'>;
  tipInterpolation?: Record<string, unknown>;
  hasCheckmark?: boolean;
  extraInfo?: ReactNode;
  formatter?: (quota: number) => string | ReactNode;
};

function GenericQuotaLimit({
  quota,
  tipPhraseKey,
  tipInterpolation,
  hasCheckmark,
  extraInfo,
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
      <TableDataWrapper tip={tipContent} extraInfo={extraInfo}>
        {hasCheckmark && <Success />}
        <DynamicT forKey="subscription.quota_table.unlimited" />
      </TableDataWrapper>
    );
  }

  return (
    <TableDataWrapper tip={tipContent} extraInfo={extraInfo}>
      {quota === 0 ? (
        '-'
      ) : (
        <>
          {hasCheckmark && <Success />}
          {formatter?.(quota) ?? quota.toLocaleString()}
        </>
      )}
    </TableDataWrapper>
  );
}

export default GenericQuotaLimit;
