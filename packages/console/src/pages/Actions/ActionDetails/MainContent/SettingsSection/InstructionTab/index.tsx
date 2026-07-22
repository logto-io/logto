import { LogtoActionKey } from '@logto/schemas';
import { Editor } from '@monaco-editor/react';
import classNames from 'classnames';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/ds-components/FormField';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import Switch from '@/ds-components/Switch';

import { type ActionForm, getOnExecutionErrorOptions } from '../../../type';
import {
  environmentVariablesCodeExample,
  fetchExternalDataCodeExample,
  sampleCodeEditorOptions,
  typeDefinitionCodeEditorOptions,
} from '../../../utils/config';
import { getEventTypeDefinition, getResultTypeDefinition } from '../../../utils/type-definitions';
import EnvironmentVariablesField from '../EnvironmentVariablesField';
import GuideCard, { CardType } from '../GuideCard';
import tabContentStyles from '../index.module.scss';

import styles from './index.module.scss';

export enum InstructionTabSection {
  DataSource = 'data-source',
  Settings = 'settings',
}

type Props = {
  readonly isActive: boolean;
  readonly section: InstructionTabSection;
};

function InstructionTab({ isActive, section }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const isSettingsSection = section === InstructionTabSection.Settings;
  const [expandedCard, setExpandedCard] = useState<CardType | undefined>(
    isSettingsSection ? CardType.Settings : undefined
  );
  const { watch, control } = useFormContext<ActionForm>();
  const actionType = watch('actionType');
  const onExecutionErrorOptions = getOnExecutionErrorOptions(actionType);
  const onExecutionErrorDescription =
    actionType === LogtoActionKey.PostFirstFactorVerification
      ? 'actions.settings.on_execution_error.post_first_factor_description'
      : 'actions.settings.on_execution_error.description';
  const isDataSourceSection = section === InstructionTabSection.DataSource;

  return (
    <div className={classNames(tabContentStyles.tabContent, isActive && tabContentStyles.active)}>
      {isDataSourceSection && (
        <>
          <GuideCard
            name={CardType.EventData}
            isExpanded={expandedCard === CardType.EventData}
            setExpanded={(expand) => {
              setExpandedCard(expand ? CardType.EventData : undefined);
            }}
          >
            <Editor
              language="typescript"
              className={styles.sampleCode}
              value={getEventTypeDefinition(actionType)}
              height="320px"
              theme="logto-dark"
              options={typeDefinitionCodeEditorOptions}
            />
          </GuideCard>
          <GuideCard
            name={CardType.ResultData}
            isExpanded={expandedCard === CardType.ResultData}
            setExpanded={(expand) => {
              setExpandedCard(expand ? CardType.ResultData : undefined);
            }}
          >
            <Editor
              language="typescript"
              className={styles.sampleCode}
              value={getResultTypeDefinition(actionType)}
              height="280px"
              theme="logto-dark"
              options={typeDefinitionCodeEditorOptions}
            />
          </GuideCard>
          <GuideCard
            name={CardType.FetchExternalData}
            isExpanded={expandedCard === CardType.FetchExternalData}
            setExpanded={(expand) => {
              setExpandedCard(expand ? CardType.FetchExternalData : undefined);
            }}
          >
            <div className={tabContentStyles.description}>
              {t('actions.fetch_external_data.description')}
            </div>
            <Editor
              language="typescript"
              className={styles.sampleCode}
              value={fetchExternalDataCodeExample}
              height="280px"
              theme="logto-dark"
              options={sampleCodeEditorOptions}
            />
          </GuideCard>
          <GuideCard
            name={CardType.EnvironmentVariables}
            isExpanded={expandedCard === CardType.EnvironmentVariables}
            setExpanded={(expand) => {
              setExpandedCard(expand ? CardType.EnvironmentVariables : undefined);
            }}
          >
            <EnvironmentVariablesField className={styles.envVariablesField} />
            <div className={tabContentStyles.description}>
              {t('actions.environment_variables.sample_code')}
            </div>
            <Editor
              language="typescript"
              className={styles.sampleCode}
              value={environmentVariablesCodeExample}
              path="file:///action-env-variables-sample.js"
              height="360px"
              theme="logto-dark"
              options={sampleCodeEditorOptions}
            />
          </GuideCard>
        </>
      )}
      {isSettingsSection && (
        <GuideCard
          name={CardType.Settings}
          isExpanded={expandedCard === CardType.Settings}
          setExpanded={(expand) => {
            setExpandedCard(expand ? CardType.Settings : undefined);
          }}
        >
          <FormField title="actions.settings.enabled.title">
            <Controller
              control={control}
              name="enabled"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  description="actions.settings.enabled.description"
                  onChange={(event) => {
                    field.onChange(event.currentTarget.checked);
                  }}
                />
              )}
            />
          </FormField>
          <FormField
            title="actions.settings.on_execution_error.title"
            description={onExecutionErrorDescription}
          >
            <Controller
              control={control}
              name="onExecutionError"
              render={({ field }) => (
                <RadioGroup name="onExecutionError" value={field.value} onChange={field.onChange}>
                  {onExecutionErrorOptions.map((option) => (
                    <Radio
                      key={option}
                      value={option}
                      title={`actions.settings.on_execution_error.${option}`}
                    />
                  ))}
                </RadioGroup>
              )}
            />
          </FormField>
        </GuideCard>
      )}
    </div>
  );
}

export default InstructionTab;
