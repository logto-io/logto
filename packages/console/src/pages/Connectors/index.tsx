import { AppearanceMode, ConnectorType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import camelcase from 'camelcase';
import classNames from 'classnames';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { snakeCase } from 'snake-case';

import Plus from '@/assets/images/plus.svg';
import SocialConnectorEmptyDark from '@/assets/images/social-connector-empty-dark.svg';
import SocialConnectorEmpty from '@/assets/images/social-connector-empty.svg';
import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import TabNav, { TabNavItem } from '@/components/TabNav';
import TableEmpty from '@/components/Table/TableEmpty';
import TableError from '@/components/Table/TableError';
import TableLoading from '@/components/Table/TableLoading';
import { ConnectorsPage } from '@/consts/page-tabs';
import useConnectorGroups from '@/hooks/use-connector-groups';
import { useTheme } from '@/hooks/use-theme';
import * as resourcesStyles from '@/scss/resources.module.scss';
import * as tableStyles from '@/scss/table.module.scss';
import { getConnectorPathname } from '@/utilities/router';

import ConnectorRow from './components/ConnectorRow';
import ConnectorStatusField from './components/ConnectorStatusField';
import CreateForm from './components/CreateForm';
import SignInExperienceSetupNotice from './components/SignInExperienceSetupNotice';
import * as styles from './index.module.scss';

const getCreatePagePathName = (connectorType: ConnectorType) =>
  `create/${snakeCase(connectorType)}`;

const isConnectorType = (value: string): value is ConnectorType =>
  Object.values<string>(ConnectorType).includes(value);

const Connectors = () => {
  const { tab = ConnectorsPage.Passwordless, createType } = useParams();
  const isSocial = tab === ConnectorsPage.SocialTab;
  const navigate = useNavigate();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate } = useConnectorGroups();
  const isLoading = !data && !error;
  const theme = useTheme();
  const isLightMode = theme === AppearanceMode.LightMode;

  const emailConnector = useMemo(() => {
    const emailConnectorGroup = data?.find(({ type }) => type === ConnectorType.Email);

    return emailConnectorGroup?.connectors[0];
  }, [data]);

  const smsConnector = useMemo(() => {
    const smsConnectorGroup = data?.find(({ type }) => type === ConnectorType.Sms);

    return smsConnectorGroup?.connectors[0];
  }, [data]);

  const socialConnectorGroups = useMemo(() => {
    if (!isSocial) {
      return;
    }

    return data?.filter(({ type }) => type === ConnectorType.Social);
  }, [data, isSocial]);

  const camelCaseCreateType = conditional(
    createType && camelcase(createType, { pascalCase: true })
  );

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
                navigate(getCreatePagePathName(ConnectorType.Social));
              }}
            />
          )}
        </div>
        <SignInExperienceSetupNotice />
        <TabNav className={styles.tabs}>
          <TabNavItem href={getConnectorPathname(ConnectorsPage.Passwordless)}>
            {t('connectors.tab_email_sms')}
          </TabNavItem>
          <TabNavItem href={getConnectorPathname(ConnectorsPage.SocialTab)}>
            {t('connectors.tab_social')}
          </TabNavItem>
        </TabNav>
        <div className={resourcesStyles.table}>
          <div className={tableStyles.scrollable}>
            <table className={classNames(!data && tableStyles.empty)}>
              <colgroup>
                <col className={styles.connectorName} />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>{t('connectors.connector_name')}</th>
                  <th>{t('connectors.connector_type')}</th>
                  <th>
                    <ConnectorStatusField />
                  </th>
                </tr>
              </thead>
              <tbody>
                {!data && error && (
                  <TableError
                    columns={3}
                    content={error.body?.message ?? error.message}
                    onRetry={async () => mutate(undefined, true)}
                  />
                )}
                {isLoading && <TableLoading columns={3} />}
                {socialConnectorGroups?.length === 0 && (
                  <TableEmpty
                    columns={3}
                    title={t('connectors.type.social')}
                    content={t('connectors.social_connector_eg')}
                    image={isLightMode ? <SocialConnectorEmpty /> : <SocialConnectorEmptyDark />}
                  >
                    <Button
                      title="connectors.create"
                      type="outline"
                      onClick={() => {
                        navigate(getCreatePagePathName(ConnectorType.Social));
                      }}
                    />
                  </TableEmpty>
                )}
                {!isLoading && !isSocial && (
                  <ConnectorRow
                    connectors={smsConnector ? [smsConnector] : []}
                    type={ConnectorType.Sms}
                    onClickSetup={() => {
                      navigate(getCreatePagePathName(ConnectorType.Sms));
                    }}
                  />
                )}
                {!isLoading && !isSocial && (
                  <ConnectorRow
                    connectors={emailConnector ? [emailConnector] : []}
                    type={ConnectorType.Email}
                    onClickSetup={() => {
                      navigate(getCreatePagePathName(ConnectorType.Email));
                    }}
                  />
                )}
                {socialConnectorGroups?.map(({ connectors, id }) => (
                  <ConnectorRow key={id} connectors={connectors} type={ConnectorType.Social} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <CreateForm
        isOpen={Boolean(createType)}
        type={conditional(
          camelCaseCreateType && isConnectorType(camelCaseCreateType) && camelCaseCreateType
        )}
        onClose={() => {
          navigate(
            getConnectorPathname(isSocial ? ConnectorsPage.SocialTab : ConnectorsPage.Passwordless)
          );
          void mutate();
        }}
      />
    </>
  );
};

export default Connectors;
