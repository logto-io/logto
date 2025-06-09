import { LogtoJwtTokenKeyType } from '@logto/schemas';
import { Editor } from '@monaco-editor/react';
import classNames from 'classnames';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { isDevFeaturesEnabled } from '@/consts/env';
import { type JwtCustomizerForm } from '@/pages/CustomizeJwtDetails/type';
import {
  denyAccessCodeExample,
  environmentVariablesCodeExample,
  fetchExternalDataCodeExample,
  sampleCodeEditorOptions,
  typeDefinitionCodeEditorOptions,
} from '@/pages/CustomizeJwtDetails/utils/config';
import {
  accessTokenPayloadTypeDefinition,
  clientCredentialsPayloadTypeDefinition,
  jwtCustomizerUserContextTypeDefinition,
  jwtCustomizerGrantContextTypeDefinition,
  jwtCustomizerUserInteractionContextTypeDefinition,
} from '@/pages/CustomizeJwtDetails/utils/type-definitions';

import tabContentStyles from '../index.module.scss';

import EnvironmentVariablesField from './EnvironmentVariablesField';
import GuideCard, { CardType } from './GuideCard';
import styles from './index.module.scss';

type Props = {
  readonly isActive: boolean;
};

/* Instructions and environment variable settings for the custom JWT claims script. */
function InstructionTab({ isActive }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [expendCard, setExpendCard] = useState<CardType>();

  const { watch } = useFormContext<JwtCustomizerForm>();
  const tokenType = watch('tokenType');

  return (
    <div className={classNames(tabContentStyles.tabContent, isActive && tabContentStyles.active)}>
      <GuideCard
        name={CardType.TokenData}
        isExpanded={expendCard === CardType.TokenData}
        setExpanded={(expand) => {
          setExpendCard(expand ? CardType.TokenData : undefined);
        }}
      >
        <Editor
          language="typescript"
          className={styles.sampleCode}
          value={
            tokenType === LogtoJwtTokenKeyType.AccessToken
              ? accessTokenPayloadTypeDefinition
              : clientCredentialsPayloadTypeDefinition
          }
          // ClientCredentials token payload has only a few fields, so it doesn't need to be as tall as the AccessToken payload.
          height={tokenType === LogtoJwtTokenKeyType.AccessToken ? '320px' : '200px'}
          theme="logto-dark"
          options={typeDefinitionCodeEditorOptions}
        />
      </GuideCard>
      {tokenType === LogtoJwtTokenKeyType.AccessToken && (
        <GuideCard
          name={CardType.UserData}
          isExpanded={expendCard === CardType.UserData}
          setExpanded={(expand) => {
            setExpendCard(expand ? CardType.UserData : undefined);
          }}
        >
          <Editor
            language="typescript"
            className={styles.sampleCode}
            value={jwtCustomizerUserContextTypeDefinition}
            height="400px"
            theme="logto-dark"
            options={typeDefinitionCodeEditorOptions}
          />
        </GuideCard>
      )}
      {tokenType === LogtoJwtTokenKeyType.AccessToken && (
        <GuideCard
          name={CardType.GrantData}
          isExpanded={expendCard === CardType.GrantData}
          setExpanded={(expand) => {
            setExpendCard(expand ? CardType.GrantData : undefined);
          }}
        >
          <Editor
            language="typescript"
            className={styles.sampleCode}
            value={jwtCustomizerGrantContextTypeDefinition}
            height="180px"
            theme="logto-dark"
            options={typeDefinitionCodeEditorOptions}
          />
        </GuideCard>
      )}
      {tokenType === LogtoJwtTokenKeyType.AccessToken && isDevFeaturesEnabled && (
        <GuideCard
          name={CardType.InteractionData}
          isExpanded={expendCard === CardType.InteractionData}
          setExpanded={(expand) => {
            setExpendCard(expand ? CardType.InteractionData : undefined);
          }}
        >
          <Editor
            language="typescript"
            className={styles.sampleCode}
            value={`declare ${jwtCustomizerUserInteractionContextTypeDefinition}`}
            height="400px"
            theme="logto-dark"
            options={typeDefinitionCodeEditorOptions}
          />
        </GuideCard>
      )}
      <GuideCard
        name={CardType.FetchExternalData}
        isExpanded={expendCard === CardType.FetchExternalData}
        setExpanded={(expand) => {
          setExpendCard(expand ? CardType.FetchExternalData : undefined);
        }}
      >
        <div className={tabContentStyles.description}>
          {t('jwt_claims.fetch_external_data.description')}
        </div>
        <Editor
          language="typescript"
          className={styles.sampleCode}
          value={fetchExternalDataCodeExample}
          height="300px"
          theme="logto-dark"
          options={sampleCodeEditorOptions}
        />
      </GuideCard>
      <GuideCard
        name={CardType.EnvironmentVariables}
        isExpanded={expendCard === CardType.EnvironmentVariables}
        setExpanded={(expand) => {
          setExpendCard(expand ? CardType.EnvironmentVariables : undefined);
        }}
      >
        <EnvironmentVariablesField className={styles.envVariablesField} />
        <div className={tabContentStyles.description}>
          {t('jwt_claims.environment_variables.sample_code')}
        </div>
        <Editor
          language="typescript"
          className={styles.sampleCode}
          value={environmentVariablesCodeExample}
          path="file:///env-variables-sample.js"
          height="400px"
          theme="logto-dark"
          options={sampleCodeEditorOptions}
        />
      </GuideCard>
      <GuideCard
        name={CardType.ApiContext}
        isExpanded={expendCard === CardType.ApiContext}
        setExpanded={(expand) => {
          setExpendCard(expand ? CardType.ApiContext : undefined);
        }}
      >
        <Editor
          language="typescript"
          className={styles.sampleCode}
          value={denyAccessCodeExample}
          height="240px"
          theme="logto-dark"
          options={sampleCodeEditorOptions}
        />
      </GuideCard>
      <div className={tabContentStyles.description}>{t('jwt_claims.jwt_claims_description')}</div>
    </div>
  );
}

export default InstructionTab;
