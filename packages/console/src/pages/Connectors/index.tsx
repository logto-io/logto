import { ServiceConnector } from '@logto/connector-kit';
import { ConnectorType } from '@logto/schemas';
import type { ConnectorFactoryResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import Plus from '@/assets/icons/plus.svg?react';
import SocialConnectorEmptyDark from '@/assets/images/social-connector-empty-dark.svg?react';
import SocialConnectorEmpty from '@/assets/images/social-connector-empty.svg?react';
import CreateConnectorForm from '@/components/CreateConnectorForm';
import ListPage from '@/components/ListPage';
import { defaultEmailConnectorGroup, defaultSmsConnectorGroup } from '@/consts';
import { ConnectorsTabs } from '@/consts/page-tabs';
import Button from '@/ds-components/Button';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import TablePlaceholder from '@/ds-components/Table/TablePlaceholder';
import type { RequestError } from '@/hooks/use-api';
import useConnectorApi from '@/hooks/use-connector-api';
import useConnectorGroups from '@/hooks/use-connector-groups';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import DemoConnectorNotice from '@/onboarding/components/DemoConnectorNotice';

import ConnectorDeleteButton from './ConnectorDeleteButton';
import ConnectorName from './ConnectorName';
import ConnectorStatus from './ConnectorStatus';
import ConnectorStatusField from './ConnectorStatusField';
import ConnectorTypeColumn from './ConnectorTypeColumn';
import Guide from './Guide';
import SignInExperienceSetupNotice from './SignInExperienceSetupNotice';
import styles from './index.module.scss';

const basePathname = '/connectors';
const passwordlessPathname = `${basePathname}/${ConnectorsTabs.Passwordless}`;
const socialPathname = `${basePathname}/${ConnectorsTabs.Social}`;

const buildTabPathname = (connectorType: ConnectorType) =>
  connectorType === ConnectorType.Social ? socialPathname : passwordlessPathname;

const buildCreatePathname = (connectorType: ConnectorType) => {
  const tabPath = buildTabPathname(connectorType);

  return `${tabPath}/create/${connectorType}`;
};

const buildGuidePathname = (connectorType: ConnectorType, factoryId: string) => {
  const tabPath = buildTabPathname(connectorType);

  return `${tabPath}/guide/${factoryId}`;
};

const isConnectorType = (value: string): value is ConnectorType =>
  Object.values<string>(ConnectorType).includes(value);

const parseToConnectorType = (value?: string): ConnectorType | undefined =>
  conditional(value && isConnectorType(value) && value);

function Connectors() {
  const { tab = ConnectorsTabs.Passwordless, createType, factoryId } = useParams();
  const createConnectorType = parseToConnectorType(createType);
  const { navigate } = useTenantPathname();
  const isSocial = tab === ConnectorsTabs.Social;
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const { createConnector } = useConnectorApi();
  const { data, error, mutate } = useConnectorGroups();
  const { data: factories, error: factoriesError } = useSWR<
    ConnectorFactoryResponse[],
    RequestError
  >('api/connector-factories');

  const isLoading = !data && !factories && !error && !factoriesError;

  const passwordlessConnectors = useMemo(() => {
    const emailConnector =
      data?.find(({ type }) => type === ConnectorType.Email) ?? defaultEmailConnectorGroup;

    const smsConnector =
      data?.find(({ type }) => type === ConnectorType.Sms) ?? defaultSmsConnectorGroup;

    return [emailConnector, smsConnector];
  }, [data]);

  const socialConnectors = useMemo(
    () => data?.filter(({ type }) => type === ConnectorType.Social),
    [data]
  );

  const connectors = isSocial ? socialConnectors : passwordlessConnectors;

  const hasDemoConnector = connectors?.some(({ isDemo }) => isDemo);

  const connectorToShowInGuide = useMemo(() => {
    if (factories && factoryId) {
      return factories.find(({ id }) => id === factoryId);
    }
  }, [factoryId, factories]);

  return (
    <ListPage
      className={styles.container}
      title={{
        title: 'connectors.title',
        subtitle: 'connectors.subtitle',
      }}
      pageMeta={{ titleKey: 'connectors.page_title' }}
      createButton={conditional(
        isSocial && {
          title: 'connectors.create',
          onClick: () => {
            navigate(buildCreatePathname(ConnectorType.Social));
          },
        }
      )}
      subHeader={
        <>
          <SignInExperienceSetupNotice />
          <TabNav className={styles.tabs}>
            <TabNavItem href={passwordlessPathname}>{t('connectors.tab_email_sms')}</TabNavItem>
            <TabNavItem href={socialPathname}>{t('connectors.tab_social')}</TabNavItem>
          </TabNav>
          {hasDemoConnector && <DemoConnectorNotice />}
        </>
      }
      table={{
        rowIndexKey: 'id',
        rowGroups: [{ key: 'connectors', data: connectors }],
        columns: [
          {
            title: t('connectors.connector_name'),
            dataIndex: 'name',
            colSpan: 6,
            render: (connectorGroup) => (
              <ConnectorName connectorGroup={connectorGroup} isDemo={connectorGroup.isDemo} />
            ),
          },
          {
            title: t('connectors.connector_type'),
            dataIndex: 'type',
            colSpan: 5,
            render: (connectorGroup) => <ConnectorTypeColumn connectorGroup={connectorGroup} />,
          },
          {
            title: <ConnectorStatusField />,
            dataIndex: 'status',
            colSpan: 4,
            render: (connectorGroup) => <ConnectorStatus connectorGroup={connectorGroup} />,
          },
          {
            title: null,
            dataIndex: 'delete',
            colSpan: 1,
            render: (connectorGroup) =>
              connectorGroup.isDemo ? (
                <ConnectorDeleteButton connectorGroup={connectorGroup} />
              ) : null,
          },
        ],
        isRowClickable: ({ connectors }) => Boolean(connectors[0]) && !connectors[0]?.isDemo,
        rowClickHandler: ({ connectors }) => {
          const firstConnector = connectors[0];

          if (!firstConnector) {
            return;
          }

          const { type, id } = firstConnector;

          navigate(
            `${type === ConnectorType.Social ? socialPathname : passwordlessPathname}/${id}`
          );
        },
        isLoading,
        errorMessage: error?.body?.message ?? error?.message,
        placeholder: conditional(
          isSocial && (
            <TablePlaceholder
              image={<SocialConnectorEmpty />}
              imageDark={<SocialConnectorEmptyDark />}
              title="connectors.placeholder_title"
              description="connectors.placeholder_description"
              learnMoreLink={{
                href: getDocumentationUrl(
                  '/docs/recipes/configure-connectors/configure-social-connector'
                ),
                targetBlank: 'noopener',
              }}
              action={
                <Button
                  title="connectors.create"
                  type="primary"
                  size="large"
                  icon={<Plus />}
                  onClick={() => {
                    navigate(buildCreatePathname(ConnectorType.Social));
                  }}
                />
              }
            />
          )
        ),
        onRetry: async () => mutate(undefined, true),
      }}
      widgets={
        <>
          <CreateConnectorForm
            isOpen={Boolean(createConnectorType)}
            type={createConnectorType}
            onClose={async (id) => {
              if (createConnectorType && id) {
                /**
                 * Note:
                 * The "Email Service Connector" is a built-in connector that can be directly created without the need for setup in the guide.
                 */
                if (id === ServiceConnector.Email) {
                  const created = await createConnector({ connectorId: id });
                  navigate(`/connectors/${ConnectorsTabs.Passwordless}/${created.id}`, {
                    replace: true,
                  });
                  return;
                }

                navigate(buildGuidePathname(createConnectorType, id), { replace: true });

                return;
              }
              navigate(`${basePathname}/${tab}`);
            }}
          />
          <Guide
            connector={connectorToShowInGuide}
            onClose={() => {
              navigate(`${basePathname}/${tab}`);
            }}
          />
        </>
      }
    />
  );
}

export default Connectors;
