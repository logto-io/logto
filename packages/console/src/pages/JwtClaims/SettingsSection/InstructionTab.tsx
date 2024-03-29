import { LogtoJwtTokenPath } from '@logto/schemas';
import { Editor } from '@monaco-editor/react';
import classNames from 'classnames';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { type JwtClaimsFormType } from '../type';
import {
  sampleCodeEditorOptions,
  typeDefinitionCodeEditorOptions,
  fetchExternalDataCodeExample,
  environmentVariablesCodeExample,
} from '../utils/config';
import {
  accessTokenPayloadTypeDefinition,
  clientCredentialsPayloadTypeDefinition,
  jwtCustomizerUserContextTypeDefinition,
} from '../utils/type-definitions';

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

  return (
    <div className={classNames(styles.tabContent, isActive && styles.active)}>
      <div className={styles.description}>{t('jwt_claims.jwt_claims_description')}</div>
      {tokenType === LogtoJwtTokenPath.AccessToken && (
        <GuideCard name={CardType.UserData}>
          <Editor
            language="typescript"
            className={styles.sampleCode}
            value={jwtCustomizerUserContextTypeDefinition}
            height="700px"
            theme="logto-dark"
            options={typeDefinitionCodeEditorOptions}
          />
        </GuideCard>
      )}
      <GuideCard name={CardType.TokenData}>
        <Editor
          language="typescript"
          className={styles.sampleCode}
          value={
            tokenType === LogtoJwtTokenPath.AccessToken
              ? accessTokenPayloadTypeDefinition
              : clientCredentialsPayloadTypeDefinition
          }
          height="350px"
          theme="logto-dark"
          options={typeDefinitionCodeEditorOptions}
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
          options={sampleCodeEditorOptions}
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
        <EnvironmentVariablesField key={tokenType} className={styles.envVariablesField} />
        <div className={styles.description}>
          {t('jwt_claims.environment_variables.sample_code')}
        </div>
        <Editor
          language="typescript"
          className={styles.sampleCode}
          value={environmentVariablesCodeExample}
          height="400px"
          theme="logto-dark"
          options={sampleCodeEditorOptions}
        />
      </GuideCard>
    </div>
  );
}

export default InstructionTab;
