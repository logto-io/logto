import { TenantTag } from '@logto/schemas';
import { useState } from 'react';

import RocketIcon from '@/assets/icons/rocket.svg?react';
import ConvertToProductionModal from '@/components/ConvertToProductionModal';
import LearnMore from '@/components/LearnMore';
import TenantEnvTag from '@/components/TenantEnvTag';
import { logtoCloudTenantSettings } from '@/consts';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';

import styles from './index.module.scss';

type Props = {
  readonly tag: TenantTag;
};

function TenantEnvironment({ tag }: Props) {
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  return (
    <div className={styles.container}>
      <div>
        <TenantEnvTag isAbbreviated={false} size="large" tag={tag} />
        <div className={styles.description}>
          <DynamicT
            forKey={
              tag === TenantTag.Development
                ? 'tenants.settings.development_description'
                : 'tenants.settings.production_description'
            }
          />
          {tag === TenantTag.Development && <LearnMore href={logtoCloudTenantSettings} />}
        </div>
      </div>
      {tag === TenantTag.Development && (
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
