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

type Props = {
  isActive: boolean;
};

function TestTab({ isActive }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.jwt_claims' });
  const { watch } = useFormContext<JwtClaimsFormType>();
  const tokenType = watch('tokenType');

  const editorModels = useMemo(
    () =>
      tokenType === JwtTokenType.UserAccessToken
        ? [userTokenPayloadTestModel, userTokenContextTestModel]
        : [machineToMachineTokenPayloadTestModel],
    [tokenType]
  );

  return (
    <div className={classNames(styles.tabContent, isActive && styles.active)}>
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
    </div>
  );
}

export default TestTab;
