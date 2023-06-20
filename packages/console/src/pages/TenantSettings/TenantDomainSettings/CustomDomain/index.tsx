import { type Domain, DomainStatus } from '@logto/schemas';
import { Trans, useTranslation } from 'react-i18next';

import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import ActivationProcess from './ActivationProcess';
import CustomDomainHeader from './CustomDomainHeader';
import * as styles from './index.module.scss';

type Props = {
  customDomain: Domain;
  onDeleteCustomDomain: () => void;
};

function CustomDomain({ customDomain, onDeleteCustomDomain }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();

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
              a: (
                <TextLink
                  to={getDocumentationUrl('docs/recipes/custom-domain/use-custom-domain')}
                />
              ),
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
