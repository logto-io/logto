import { LogtoJwtTokenPath } from '@logto/schemas';
import { Editor } from '@monaco-editor/react';
import classNames from 'classnames';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Table from '@/ds-components/Table';

import { type JwtClaimsFormType } from '../type';
import {
  userDataDescription,
  tokenDataDescription,
  fetchExternalDataEditorOptions,
  fetchExternalDataCodeExample,
} from '../utils/config';

import EnvironmentVariablesField from './EnvironmentVariablesField';
import GuideCard, { CardType } from './GuideCard';
import * as styles from './index.module.scss';

type Props = {
  isActive: boolean;
};

/* Instructions and environment variable settings for the custom JWT claims script. */
function InstructionTab({ isActive }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { watch } = useFormContext<JwtClaimsFormType>();
  const tokenType = watch('tokenType');

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
    <div className={classNames(styles.tabContent, isActive && styles.active)}>
      <div className={styles.description}>{t('jwt_claims.jwt_claims_description')}</div>
      {tokenType === LogtoJwtTokenPath.AccessToken && (
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
        <div className={styles.description}>{t('jwt_claims.fetch_external_data.description')}</div>
        <Editor
          language="typescript"
          className={styles.sampleCode}
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
  );
}

export default InstructionTab;
