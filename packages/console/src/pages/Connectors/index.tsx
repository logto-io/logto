import { ConnectorType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import Plus from '@/assets/images/plus.svg';
import SocialConnectorEmptyDark from '@/assets/images/social-connector-empty-dark.svg';
import SocialConnectorEmpty from '@/assets/images/social-connector-empty.svg';
import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import TabNav, { TabNavItem } from '@/components/TabNav';
import Table from '@/components/Table';
import TablePlaceholder from '@/components/Table/TablePlaceholder';
import { defaultEmailConnectorGroup, defaultSmsConnectorGroup } from '@/consts';
import { ConnectorsTabs } from '@/consts/page-tabs';
import useConnectorGroups from '@/hooks/use-connector-groups';
import * as resourcesStyles from '@/scss/resources.module.scss';

import ConnectorName from './components/ConnectorName';
import ConnectorStatus from './components/ConnectorStatus';
import ConnectorStatusField from './components/ConnectorStatusField';
import ConnectorTypeColumn from './components/ConnectorTypeColumn';
import CreateForm from './components/CreateForm';
import SignInExperienceSetupNotice from './components/SignInExperienceSetupNotice';
import * as styles from './index.module.scss';

const basePathname = '/connectors';
const passwordlessPathname = `${basePathname}/${ConnectorsTabs.Passwordless}`;
const socialPathname = `${basePathname}/${ConnectorsTabs.Social}`;

const buildCreatePathname = (connectorType: ConnectorType) => {
  const pathname = connectorType === ConnectorType.Social ? socialPathname : passwordlessPathname;

  return `${pathname}/create/${connectorType}`;
};

const isConnectorType = (value: string): value is ConnectorType =>
  Object.values<string>(ConnectorType).includes(value);

const parseToConnectorType = (value?: string): ConnectorType | undefined =>
  conditional(value && isConnectorType(value) && value);

const Connectors = () => {
  const { tab = ConnectorsTabs.Passwordless, createType } = useParams();
  const createConnectorType = parseToConnectorType(createType);
  const navigate = useNavigate();
  const isSocial = tab === ConnectorsTabs.Social;
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate } = useConnectorGroups();
  const isLoading = !data && !error;

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

  return (
    <>
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
        <Table
          className={resourcesStyles.table}
          rowIndexKey="id"
          rowGroups={[{ key: 'connectors', data: connectors }]}
          columns={[
            {
              title: t('connectors.connector_name'),
              dataIndex: 'name',
              colSpan: 6,
              render: (connectorGroup) => <ConnectorName connectorGroup={connectorGroup} />,
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
              colSpan: 5,
              render: (connectorGroup) => <ConnectorStatus connectorGroup={connectorGroup} />,
            },
          ]}
          isRowClickable={({ connectors }) => Boolean(connectors[0])}
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
      {Boolean(createConnectorType) && (
        <CreateForm
          isOpen
          type={createConnectorType}
          onClose={() => {
            navigate(`${basePathname}/${tab}`);
            void mutate();
          }}
        />
      )}
    </>
  );
};

export default Connectors;
