import { type TenantTag } from '@logto/schemas';
import { useContext, useState } from 'react';

import RocketIcon from '@/assets/icons/rocket.svg?react';
import ConvertToProductionModal from '@/components/ConvertToProductionModal';
import LearnMore from '@/components/LearnMore';
import TenantEnvTag from '@/components/TenantEnvTag';
import { logtoCloudTenantSettings } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import { isDevOnlyRegion } from '@/hooks/use-available-regions';

import styles from './index.module.scss';

type Props = {
  readonly tag: TenantTag;
};

function TenantEnvironment({ tag }: Props) {
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const { currentTenant, isDevTenant } = useContext(TenantsContext);

  return (
    <div className={styles.container}>
      <div>
        <TenantEnvTag isAbbreviated={false} size="large" tag={tag} />
        <div className={styles.description}>
          <DynamicT
            forKey={
              isDevTenant
                ? 'tenants.settings.development_description'
                : 'tenants.settings.production_description'
            }
          />
          {isDevTenant && <LearnMore href={logtoCloudTenantSettings} />}
        </div>
      </div>
      {isDevTenant && !isDevOnlyRegion(currentTenant?.regionName) && (
        <>
          <Button
            className={styles.button}
            type="outline"
            icon={<RocketIcon />}
            title="get_started.convert_to_production.convert_button"
            onClick={() => {
              setIsConvertModalOpen(true);
            }}
          />
          <ConvertToProductionModal
            isOpen={isConvertModalOpen}
            onClose={() => {
              setIsConvertModalOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}

export default TenantEnvironment;
