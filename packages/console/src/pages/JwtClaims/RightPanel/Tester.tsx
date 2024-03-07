import classNames from 'classnames';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';

import MonacoCodeEditor from '../MonacoCodeEditor/index.js';
import {
  userTokenPayloadTestModel,
  machineToMachineTokenPayloadTestModel,
  userTokenContextTestModel,
  JwtTokenType,
} from '../config.js';
import { type JwtClaimsFormType } from '../type.js';

import * as styles from './index.module.scss';

function Tester() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.jwt_claims' });
  const { watch } = useFormContext<JwtClaimsFormType>();

  const tokenTypeValue = watch('tokenType');

  const editorModels = useMemo(
    () =>
      tokenTypeValue === JwtTokenType.UserAccessToken
        ? [userTokenPayloadTestModel, userTokenContextTestModel]
        : [machineToMachineTokenPayloadTestModel],
    [tokenTypeValue]
  );

  return (
    <Card className={classNames(styles.card, styles.flexGrow, styles.flexColumn)}>
      <div className={styles.headerRow}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>{t('tester.title')}</div>
          <div className={styles.cardSubtitle}>{t('tester.subtitle')}</div>
        </div>
        <Button title="jwt_claims.tester.run_button" type="primary" />
      </div>
      <div className={classNames(styles.cardContent, styles.flexColumn, styles.flexGrow)}>
        <MonacoCodeEditor models={editorModels} className={styles.flexGrow} />
      </div>
    </Card>
  );
}

export default Tester;
