import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import { is } from 'superstruct';

import NavBar from '@/components/NavBar';
import PasscodeValidation from '@/containers/PasscodeValidation';
import ErrorPage from '@/pages/ErrorPage';
import { UserFlow } from '@/types';
import { passcodeStateGuard, passcodeMethodGuard, userFlowGuard } from '@/types/guard';

import * as styles from './index.module.scss';

type Parameters = {
  type: UserFlow;
  method: string;
};

const Passcode = () => {
  const { t } = useTranslation();
  const { method, type = '' } = useParams<Parameters>();
  const { state } = useLocation();
  const invalidType = !is(type, userFlowGuard);
  const invalidMethod = !is(method, passcodeMethodGuard);
  const invalidState = !is(state, passcodeStateGuard);

  if (invalidType || invalidMethod) {
    return <ErrorPage />;
  }

  const target = !invalidState && state[method];

  if (!target) {
    return <ErrorPage title={method === 'email' ? 'error.invalid_email' : 'error.invalid_phone'} />;
  }

  return (
    <div className={styles.wrapper}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.title}>{t('action.enter_passcode')}</div>
        <div className={styles.detail}>
          {t('description.enter_passcode', {
            address: t(`description.${method === 'email' ? 'email' : 'phone_number'}`),
          })}
        </div>
        <PasscodeValidation type={type} method={method} target={target} />
      </div>
    </div>
  );
};

export default Passcode;
