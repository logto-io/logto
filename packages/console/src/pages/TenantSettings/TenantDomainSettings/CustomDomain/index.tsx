import { type Domain, DomainStatus } from '@logto/schemas';
import { Trans, useTranslation } from 'react-i18next';

import TextLink from '@/components/TextLink';

import ActivationProcess from './ActivationProcess';
import CustomDomainHeader from './CustomDomainHeader';
import * as styles from './index.module.scss';

type Props = {
  customDomain: Domain;
  onDeleteCustomDomain: () => void;
};

function CustomDomain({ customDomain, onDeleteCustomDomain }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <>
      <div className={styles.container}>
        <CustomDomainHeader
          customDomain={customDomain}
          onDeleteCustomDomain={onDeleteCustomDomain}
        />
        {customDomain.status !== DomainStatus.Active && (
          <ActivationProcess customDomain={customDomain} />
        )}
      </div>
      {customDomain.status === DomainStatus.Active && (
        <div className={styles.notes}>
          <Trans
            components={{
              // TODO LOG-6298 @xiaoyijun update this link when related docs are ready.
              a: <TextLink to="#" />,
            }}
          >
            {t('domain.update_endpoint_notice', { link: t('general.learn_more') })}
          </Trans>
        </div>
      )}
    </>
  );
}

export default CustomDomain;
