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
  fetchExternalDataCodeExample,
} from '../config';

import EnvironmentVariablesField from './EnvironmentVariablesField';
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
            value={fetchExternalDataCodeExample}
            height="300px"
            theme="logto-dark"
            options={fetchExternalDataEditorOptions}
          />
        </GuideCard>
        <GuideCard name={CardType.EnvironmentVariables}>
          {/**
           * We use useFieldArray hook to manage the list of environment variables in the EnvironmentVariablesField component.
           * useFieldArray will read the form context and return the necessary methods and values to manage the list.
           * The form context will mutate when the tokenType changes. It will provide different form state and methods based on the tokenType. (@see JwtClaims component.)
           * However, the form context/controller updates did not trigger a re-render of the useFieldArray hook. (@see {@link https://github.com/react-hook-form/react-hook-form/blob/master/src/useFieldArray.ts#L95})
           *
           * This cause issues when the tokenType changes and the environment variables list is not rerendered. The form state will be stale.
           * In order to fix this, we need to re-render the EnvironmentVariablesField component when the tokenType changes.
           * Achieve this by adding a key to the EnvironmentVariablesField component. Force a re-render when the tokenType changes.
           */}
          <EnvironmentVariablesField key={tokenType} />
        </GuideCard>
      </div>
    </div>
  );
}

export default RightPanel;
