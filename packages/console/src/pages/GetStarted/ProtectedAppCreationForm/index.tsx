import { type Application } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useSWR from 'swr';

import OpenExternalLink from '@/components/OpenExternalLink';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import useApplicationsUsage from '@/hooks/use-applications-usage';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import ProtectedAppCard from '@/pages/Applications/components/ProtectedAppCard';
import ProtectedAppForm from '@/pages/Applications/components/ProtectedAppForm';

import styles from './index.module.scss';

function ProtectedAppCreationForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getTo } = useTenantPathname();
  const { data, isLoading, mutate } = useSWR<Application[]>('api/applications?types=Protected');
  const { hasAppsReachedLimit } = useApplicationsUsage();
  const hasProtectedApps = !isLoading && !!data?.length;
  const showCreationForm = !hasProtectedApps && !hasAppsReachedLimit;

  const mutateApps = useCallback(
    (app: Application) => {
      void mutate([...(data ?? []), app]);
    },
    [data, mutate]
  );

  if (isLoading) {
    return (
      <div className={styles.loadingSkeleton}>
        <div className={classNames(styles.bone, styles.icon)} />
        <div className={styles.columnWrapper}>
          <div className={classNames(styles.bone, styles.title)} />
          <div className={classNames(styles.bone, styles.description)} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ProtectedAppCard hasCreateButton={!showCreationForm} onCreateSuccess={mutateApps} />
      {showCreationForm && (
        <>
          <div className={styles.separator} />
          <div className={styles.form}>
            <ProtectedAppForm
              hasDetailedInstructions
              buttonAlignment="left"
              buttonText="protected_app.form.create_protected_app"
              buttonSize="medium"
              onCreateSuccess={mutateApps}
            />
          </div>
        </>
      )}
      {hasProtectedApps && (
        <div className={styles.protectedApps}>
          <div className={styles.label}>{t('protected_app.success_message')}</div>
          <div className={styles.list}>
            {data.map((app) => {
              const { host, customDomains } = app.protectedAppMetadata ?? {};
              const domain = customDomains?.[0]?.domain ?? host;
              return (
                !!domain && (
                  <div key={app.id} className={styles.app}>
                    <div className={styles.status} />
                    <Link className={styles.hostName} to={getTo(`/applications/${app.id}`)}>
                      {domain}
                    </Link>
                    <CopyToClipboard value={domain} variant="icon" />
                    <OpenExternalLink link={`https://${domain}`} />
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
