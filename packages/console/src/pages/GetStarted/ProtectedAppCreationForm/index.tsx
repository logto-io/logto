import { type Application } from '@logto/schemas';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useSWR from 'swr';

import ExternalLinkIcon from '@/assets/icons/external-link.svg';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import IconButton from '@/ds-components/IconButton';
import { Tooltip } from '@/ds-components/Tip';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import ProtectedAppCard from '@/pages/Applications/components/ProtectedAppCard';
import ProtectedAppForm from '@/pages/Applications/components/ProtectedAppForm';

import * as styles from './index.module.scss';

function ProtectedAppCreationForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getTo } = useTenantPathname();
  const { data, mutate } = useSWR<Application[]>('api/applications?types=Protected');
  const hasProtectedApps = !!data?.length;

  const mutateApps = useCallback(
    (app: Application) => {
      void mutate([...(data ?? []), app]);
    },
    [data, mutate]
  );

  return (
    <div className={styles.container}>
      <ProtectedAppCard hasCreateButton={hasProtectedApps} onCreateSuccess={mutateApps} />
      <div className={styles.separator} />
      {!hasProtectedApps && (
        <div className={styles.form}>
          <ProtectedAppForm
            hasDetailedInstructions
            buttonAlignment="left"
            buttonText="protected_app.form.create_protected_app"
            buttonSize="medium"
            onCreateSuccess={mutateApps}
          />
        </div>
      )}
      {hasProtectedApps && (
        <div className={styles.protectedApps}>
          <div className={styles.label}>{t('protected_app.success_message')}</div>
          <div className={styles.list}>
            {data.map((app) => {
              const host = app.protectedAppMetadata?.host;
              return (
                !!host && (
                  <div key={app.id} className={styles.app}>
                    <div className={styles.status} />
                    <Link className={styles.hostName} to={getTo(`/applications/${app.id}`)}>
                      {host}
                    </Link>
                    <CopyToClipboard value={host} variant="icon" />
                    <Tooltip content={t('general.open')}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          window.open(`https://${host}`, '_blank');
                        }}
                      >
                        <ExternalLinkIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                )
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProtectedAppCreationForm;
