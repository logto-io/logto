import { AppearanceMode, ConnectorType } from '@logto/schemas';
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
import TableEmpty from '@/components/Table/TableEmpty';
import TableError from '@/components/Table/TableError';
import TableLoading from '@/components/Table/TableLoading';
import { ConnectorsTabs } from '@/consts/page-tabs';
import useConnectorGroups from '@/hooks/use-connector-groups';
import { useTheme } from '@/hooks/use-theme';
import * as resourcesStyles from '@/scss/resources.module.scss';
import * as tableStyles from '@/scss/table.module.scss';

import ConnectorRow from './components/ConnectorRow';
import ConnectorStatusField from './components/ConnectorStatusField';
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
                        navigate(buildCreatePathname(ConnectorType.Social));
                      }}
                    />
                  </TableEmpty>
                )}
                {!isLoading && !isSocial && (
                  <ConnectorRow
                    connectors={smsConnector ? [smsConnector] : []}
                    type={ConnectorType.Sms}
                    onClickSetup={() => {
                      navigate(buildCreatePathname(ConnectorType.Sms));
                    }}
                  />
                )}
                {!isLoading && !isSocial && (
                  <ConnectorRow
                    connectors={emailConnector ? [emailConnector] : []}
                    type={ConnectorType.Email}
                    onClickSetup={() => {
                      navigate(buildCreatePathname(ConnectorType.Email));
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
