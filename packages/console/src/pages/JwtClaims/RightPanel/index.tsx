import { Editor } from '@monaco-editor/react';
import classNames from 'classnames';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BookIcon from '@/assets/icons/book.svg';
import StartIcon from '@/assets/icons/start.svg';
import Button from '@/ds-components/Button';
import Table from '@/ds-components/Table';

import {
  JwtTokenType,
  userDataDescription,
  tokenDataDescription,
  fetchExternalDataEditorOptions,
  fetchExternalDataExample,
} from '../config';

import GuideCard, { CardType } from './GuideCard';
import * as styles from './index.module.scss';

enum Tab {
  DataSource = 'data_source_tab',
  Test = 'test_tab',
}

type Props = {
  tokenType: JwtTokenType;
};

function RightPanel({ tokenType }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DataSource);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const getDataColumns = useCallback(
    (valueColSpan = 10) => [
      {
        title: t('domain.custom.dns_table.value_field'),
        dataIndex: 'value',
        colSpan: valueColSpan,
        render: ({ value }: (typeof userDataDescription)[0]) => (
          <span className={styles.value}>{value}</span>
        ),
      },
      {
        title: t('general.description'),
        dataIndex: 'description',
        colSpan: 24 - valueColSpan,
        render: ({ description }: (typeof userDataDescription)[0]) => (
          <span className={styles.description}>{description}</span>
        ),
      },
    ],
    [t]
  );

  return (
    <div>
      <div className={styles.tabs}>
        {Object.values(Tab).map((tab) => (
          <Button
            key={tab}
            type="primary"
            icon={tab === Tab.DataSource ? <BookIcon /> : <StartIcon />}
            title={`jwt_claims.${tab}`}
            className={classNames(styles.tab, activeTab === tab && styles.active)}
            onClick={() => {
              setActiveTab(tab);
            }}
          />
        ))}
      </div>
      <div className={classNames(styles.tabContent, activeTab === Tab.DataSource && styles.active)}>
        <div className={styles.description}>{t('jwt_claims.jwt_claims_description')}</div>
        {tokenType === JwtTokenType.UserAccessToken && (
          <GuideCard name={CardType.UserData}>
            <Table
              hasBorder
              isRowHoverEffectDisabled
              className={styles.table}
              rowIndexKey="value"
              columns={getDataColumns()}
              rowGroups={[{ key: 'user_data', data: userDataDescription }]}
            />
          </GuideCard>
        )}
        <GuideCard name={CardType.TokenData}>
          <Table
            hasBorder
            isRowHoverEffectDisabled
            className={styles.table}
            rowIndexKey="value"
            columns={getDataColumns(6)}
            rowGroups={[{ key: 'token_data', data: tokenDataDescription }]}
          />
        </GuideCard>
        <GuideCard name={CardType.FetchExternalData}>
          <div className={styles.description}>
            {t('jwt_claims.fetch_external_data.description')}
          </div>
          <Editor
            language="typescript"
            className={styles.editor}
            value={fetchExternalDataExample}
            height="300px"
            theme="logto-dark"
            options={fetchExternalDataEditorOptions}
          />
        </GuideCard>
        <GuideCard name={CardType.EnvironmentVariables} />
      </div>
    </div>
  );
}

export default RightPanel;
