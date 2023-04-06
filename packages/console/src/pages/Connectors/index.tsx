import { appInsightsReact } from '@logto/app-insights/react';
import type { ConnectorFactoryResponse } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';

import Plus from '@/assets/images/plus.svg';
import SocialConnectorEmptyDark from '@/assets/images/social-connector-empty-dark.svg';
import SocialConnectorEmpty from '@/assets/images/social-connector-empty.svg';
import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import PageMeta from '@/components/PageMeta';
import TabNav, { TabNavItem } from '@/components/TabNav';
import Table from '@/components/Table';
import TablePlaceholder from '@/components/Table/TablePlaceholder';
import { defaultEmailConnectorGroup, defaultSmsConnectorGroup } from '@/consts';
import { ConnectorsTabs } from '@/consts/page-tabs';
import type { RequestError } from '@/hooks/use-api';
import useConnectorGroups from '@/hooks/use-connector-groups';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import DemoConnectorNotice from '@/onboarding/components/DemoConnectorNotice';
import * as resourcesStyles from '@/scss/resources.module.scss';

import ConnectorDeleteButton from './components/ConnectorDeleteButton';
import ConnectorName from './components/ConnectorName';
import ConnectorStatus from './components/ConnectorStatus';
import ConnectorStatusField from './components/ConnectorStatusField';
import ConnectorTypeColumn from './components/ConnectorTypeColumn';
import CreateForm from './components/CreateForm';
import Guide from './components/Guide';
import SignInExperienceSetupNotice from './components/SignInExperienceSetupNotice';
import * as styles from './index.module.scss';

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
  const navigate = useNavigate();
  const isSocial = tab === ConnectorsTabs.Social;
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();

  const { data, error, mutate } = useConnectorGroups();
  const { data: factories, error: factoriesError } = useSWR<
    ConnectorFactoryResponse[],
    RequestError
  >('api/connector-factories');

  const isLoading = !data && !factories && !error && !factoriesError;

  const passwordlessConnectors = useMemo(() => {
    const smsConnector =
      data?.find(({ type }) => type === ConnectorType.Sms) ?? defaultSmsConnectorGroup;

    const emailConnector =
      data?.find(({ type }) => type === ConnectorType.Email) ?? defaultEmailConnectorGroup;

    return [smsConnector, emailConnector];
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
    <>
      <PageMeta titleKey="connectors.page_title" />
      <div className={classNames(resourcesStyles.container, styles.container)}>
        <div className={resourcesStyles.headline}>
          <CardTitle title="connectors.title" subtitle="connectors.subtitle" />
          {isSocial && (
            <Button
              title="connectors.create"
              type="primary"
              size="large"
              icon={<Plus />}
              onClick={() => {
                navigate(buildCreatePathname(ConnectorType.Social));
              }}
            />
          )}
        </div>
        <SignInExperienceSetupNotice />
        <TabNav className={styles.tabs}>
          <TabNavItem href={passwordlessPathname}>{t('connectors.tab_email_sms')}</TabNavItem>
          <TabNavItem href={socialPathname}>{t('connectors.tab_social')}</TabNavItem>
        </TabNav>
        {hasDemoConnector && <DemoConnectorNotice />}
        <Table
          className={resourcesStyles.table}
          rowIndexKey="id"
          rowGroups={[{ key: 'connectors', data: connectors }]}
          columns={[
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
          ]}
          isRowClickable={({ connectors }) => Boolean(connectors[0]) && !connectors[0]?.isDemo}
          rowClickHandler={({ connectors }) => {
            const firstConnector = connectors[0];

            if (!firstConnector) {
              return;
            }

            const { type, id } = firstConnector;

            navigate(
              `${type === ConnectorType.Social ? socialPathname : passwordlessPathname}/${id}`
            );
          }}
          isLoading={isLoading}
          errorMessage={error?.body?.message ?? error?.message}
          placeholder={
            isSocial && (
              <TablePlaceholder
                image={<SocialConnectorEmpty />}
                imageDark={<SocialConnectorEmptyDark />}
                title="connectors.placeholder_title"
                description="connectors.placeholder_description"
                learnMoreLink={getDocumentationUrl(
                  '/docs/recipes/configure-connectors/configure-social-connector'
                )}
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
          }
          onRetry={async () => mutate(undefined, true)}
        />
      </div>
      <CreateForm
        isOpen={Boolean(createConnectorType)}
        type={createConnectorType}
        onClose={(id) => {
          if (createConnectorType && id) {
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
  );
}

export default appInsightsReact.withAppInsights(Connectors);
