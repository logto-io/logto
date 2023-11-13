import { withAppInsights } from '@logto/app-insights/react';
import { type SsoConnectorWithProviderConfig, Theme } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Plus from '@/assets/icons/plus.svg';
import EnterpriseSsoConnectorEmptyDark from '@/assets/images/social-connector-empty-dark.svg';
import EnterpriseSsoConnectorEmpty from '@/assets/images/social-connector-empty.svg';
import ItemPreview from '@/components/ItemPreview';
import ListPage from '@/components/ListPage';
import { defaultPageSize } from '@/consts';
import Button from '@/ds-components/Button';
import ImageWithErrorFallback from '@/ds-components/ImageWithErrorFallback';
import TablePlaceholder from '@/ds-components/Table/TablePlaceholder';
import Tag from '@/ds-components/Tag';
import type { RequestError } from '@/hooks/use-api';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useTheme from '@/hooks/use-theme';
import { buildUrl } from '@/utils/url';

import * as styles from './index.module.scss';

const pageSize = defaultPageSize;
const enterpriseSsoPathname = '/enterprise-sso';
const createEnterpriseSsoPathname = `${enterpriseSsoPathname}/create`;
const buildDetailsPathname = (id: string) => `${enterpriseSsoPathname}/${id}`;

function EnterpriseSsoConnectors() {
  const theme = useTheme();

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
            navigate({ pathname: createEnterpriseSsoPathname });
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
            render: ({ id, connectorName, providerLogo, branding }) => (
              <ItemPreview
                title={connectorName}
                icon={
                  <ImageWithErrorFallback
                    className={styles.logo}
                    containerClassName={styles.container}
                    alt="logo"
                    src={
                      theme === Theme.Dark && branding.darkLogo
                        ? branding.darkLogo
                        : branding.logo ?? providerLogo
                    }
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
            render: ({ providerName }) => <div className={styles.type}>{providerName}</div>,
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
            render: ({ providerConfig }) => (
              <Tag type="state" status={providerConfig ? 'success' : 'error'} variant="plain">
                {t(
                  providerConfig
                    ? 'enterprise_sso.col_status_in_use'
                    : 'enterprise_sso.col_status_invalid'
                )}
              </Tag>
            ),
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
                  navigate({ pathname: createEnterpriseSsoPathname });
                }}
              />
            }
          />
        ),
        onRetry: async () => mutate(undefined, true),
      }}
    />
  );
}

export default withAppInsights(EnterpriseSsoConnectors);
