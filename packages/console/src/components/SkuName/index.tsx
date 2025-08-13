import { ReservedPlanId } from '@logto/schemas';
import { type TFuncKey } from 'i18next';
import { useTranslation } from 'react-i18next';

const registeredPlanNamePhraseMap: Record<
  string,
  TFuncKey<'translation', 'admin_console.subscription'>
> = {
  [ReservedPlanId.Free]: 'free_plan',
  [ReservedPlanId.Pro]: 'pro_plan',
  [ReservedPlanId.Pro202411]: 'pro_plan',
  [ReservedPlanId.Pro202509]: 'pro_plan',
  [ReservedPlanId.Development]: 'dev_plan',
  [ReservedPlanId.Admin]: 'admin_plan',
} satisfies Record<ReservedPlanId, TFuncKey<'translation', 'admin_console.subscription'>>;

const getRegisteredSkuNamePhrase = (
  skuId: string
): TFuncKey<'translation', 'admin_console.subscription'> => {
  const reservedSkuNamePhrase = registeredPlanNamePhraseMap[skuId];

  return reservedSkuNamePhrase ?? 'enterprise';
};

type Props = {
  readonly skuId: string;
};

function SkuName({ skuId }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.subscription' });
  const skuNamePhrase = getRegisteredSkuNamePhrase(skuId);
  return <span>{String(t(skuNamePhrase))}</span>;
}

export default SkuName;
