import { withAppInsights } from '@logto/app-insights/react';
import { type SsoConnectorWithProviderConfig, SsoProviderName } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import useSWR from 'swr';

import Plus from '@/assets/icons/plus.svg';
import EnterpriseSsoConnectorEmptyDark from '@/assets/images/social-connector-empty-dark.svg';
import EnterpriseSsoConnectorEmpty from '@/assets/images/social-connector-empty.svg';
import ItemPreview from '@/components/ItemPreview';
import ListPage from '@/components/ListPage';
import { defaultPageSize } from '@/consts';
import Button from '@/ds-components/Button';
import TablePlaceholder from '@/ds-components/Table/TablePlaceholder';
import Tag from '@/ds-components/Tag';
import type { RequestError } from '@/hooks/use-api';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { buildUrl } from '@/utils/url';

import SsoConnectorLogo from './SsoConnectorLogo';
import SsoCreationModal from './SsoCreationModal';
import * as styles from './index.module.scss';

const pageSize = defaultPageSize;
const enterpriseSsoPathname = '/enterprise-sso';
const createEnterpriseSsoPathname = `${enterpriseSsoPathname}/create`;
const buildDetailsPathname = (id: string) => `${enterpriseSsoPathname}/${id}`;

function EnterpriseSsoConnectors() {
  const { pathname } = useLocation();
  const { navigate } = useTenantPathname();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [{ page }, updateSearchParameters] = useSearchParametersWatcher({
    page: 1,
  });

  const url = buildUrl('api/sso-connectors', {
    page: String(page),
    page_size: String(pageSize),
  });

  const { data, error, mutate } = useSWR<[SsoConnectorWithProviderConfig[], number], RequestError>(
    url
  );

  const isLoading = !data && !error;
  const [ssoConnectors, totalCount] = data ?? [];

  return (
    <ListPage
      title={{
        title: 'enterprise_sso.title',
        subtitle: 'enterprise_sso.subtitle',
      }}
      pageMeta={{ titleKey: 'enterprise_sso.page_title' }}
      createButton={conditional(
        ssoConnectors?.length && {
          title: 'enterprise_sso.create',
          onClick: () => {
            navigate(createEnterpriseSsoPathname);
          },
        }
      )}
      table={{
        rowGroups: [{ key: 'enterprise_sso', data: ssoConnectors }],
        rowIndexKey: 'id',
        isLoading,
        errorMessage: error?.body?.message ?? error?.message,
        columns: [
          {
            title: t('enterprise_sso.col_connector_name'),
            dataIndex: 'name',
            colSpan: 256,
            render: ({ id, connectorName, ...rest }) => (
              <ItemPreview
                title={connectorName}
                icon={
                  <SsoConnectorLogo
                    className={styles.logo}
                    containerClassName={styles.container}
                    data={rest}
                  />
                }
                to={buildDetailsPathname(id)}
              />
            ),
          },
          {
            title: t('enterprise_sso.col_type'),
            dataIndex: 'type',
            colSpan: 256,
            render: ({ name }) => (
              <div className={styles.type}>
                <span>{name}</span>
              </div>
            ),
          },
          {
            title: t('enterprise_sso.col_email_domain'),
            dataIndex: 'emailDomain',
            colSpan: 326,
            render: ({ domains }) =>
              domains.length === 0 ? (
                '-'
              ) : (
                <div className={styles.domains}>
                  {domains.map((domain, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Tag key={index} variant="cell">
                      {domain}
                    </Tag>
                  ))}
                </div>
              ),
          },
          {
            title: t('enterprise_sso.col_status'),
            dataIndex: 'status',
            colSpan: 186,
            render: ({ providerConfig, providerName }) => {
              const inUse = [
                SsoProviderName.OIDC,
                SsoProviderName.GOOGLE_WORKSPACE,
                SsoProviderName.OKTA,
              ].includes(providerName)
                ? Boolean(providerConfig)
                : Boolean(providerConfig?.identityProvider);
              return (
                <Tag type="state" status={inUse ? 'success' : 'error'} variant="plain">
                  {t(
                    inUse ? 'enterprise_sso.col_status_in_use' : 'enterprise_sso.col_status_invalid'
                  )}
                </Tag>
              );
            },
          },
        ],
        rowClickHandler: ({ id }) => {
          navigate(buildDetailsPathname(id));
        },
        pagination: {
          page,
          totalCount,
          pageSize,
          onChange: (page) => {
            updateSearchParameters({ page });
          },
        },
        placeholder: (
          <TablePlaceholder
            image={<EnterpriseSsoConnectorEmpty />}
            imageDark={<EnterpriseSsoConnectorEmptyDark />}
            title="enterprise_sso.placeholder_title"
            description="enterprise_sso.placeholder_description"
            action={
              <Button
                title="enterprise_sso.create"
                type="primary"
                size="large"
                icon={<Plus />}
                onClick={() => {
                  navigate(createEnterpriseSsoPathname);
                }}
              />
            }
          />
        ),
        onRetry: async () => mutate(undefined, true),
      }}
      widgets={
        <SsoCreationModal
          isOpen={pathname.endsWith(createEnterpriseSsoPathname)}
          onClose={(ssoConnector) => {
            if (ssoConnector) {
              void mutate();
              navigate(buildDetailsPathname(ssoConnector.id));
              return;
            }

            navigate(enterpriseSsoPathname);
          }}
        />
      }
    />
  );
}

export default withAppInsights(EnterpriseSsoConnectors);
