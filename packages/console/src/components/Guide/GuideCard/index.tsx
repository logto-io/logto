import { ApplicationType } from '@logto/schemas';
import classNames from 'classnames';
import { Suspense, useCallback, useContext } from 'react';

import { type Guide, type GuideMetadata } from '@/assets/docs/guides/types';
import ProTag from '@/components/ProTag';
import { isCloud } from '@/consts/env';
import { subscriptionPage } from '@/consts/pages';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import useSubscriptionPlan from '@/hooks/use-subscription-plan';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './index.module.scss';

export type SelectedGuide = {
  id: Guide['id'];
  target: GuideMetadata['target'];
  name: GuideMetadata['name'];
};

type Props = {
  data: Guide;
  onClick: (data: SelectedGuide) => void;
  hasBorder?: boolean;
  hasButton?: boolean;
};

function GuideCard({ data, onClick, hasBorder, hasButton }: Props) {
  const { navigate } = useTenantPathname();
  const { currentTenantId } = useContext(TenantsContext);
  const { data: currentPlan } = useSubscriptionPlan(currentTenantId);
  const isM2mDisabled = isCloud && currentPlan?.quota.machineToMachineLimit === 0;

  const {
    id,
    Logo,
    metadata: { target, name, description },
  } = data;

  const isSubscriptionRequired = isM2mDisabled && target === ApplicationType.MachineToMachine;
  const buttonText = isSubscriptionRequired
    ? 'upsell.upgrade_plan'
    : target === 'API'
    ? 'guide.get_started'
    : 'guide.start_building';

  const handleClick = useCallback(() => {
    if (isSubscriptionRequired) {
      navigate(subscriptionPage);
    } else {
      onClick({ id, target, name });
    }
  }, [id, isSubscriptionRequired, name, target, navigate, onClick]);

  return (
    <div
      className={classNames(
        styles.card,
        hasBorder && styles.hasBorder,
        hasButton && styles.hasButton
      )}
      {...(!hasButton && {
        tabIndex: 0,
        role: 'button',
        onKeyDown: onKeyDownHandler(handleClick),
        onClick: handleClick,
      })}
    >
      <div className={styles.header}>
        <Suspense fallback={<div className={styles.logoSkeleton} />}>
          <Logo className={styles.logo} />
        </Suspense>
        <div className={styles.infoWrapper}>
          <div className={styles.flexRow}>
            <div className={styles.name}>{name}</div>
            {isSubscriptionRequired && <ProTag />}
          </div>
          <div className={styles.description} title={description}>
            {description}
          </div>
        </div>
      </div>
      {hasButton && <Button title={buttonText} size="small" onClick={handleClick} />}
    </div>
  );
}

export default GuideCard;
