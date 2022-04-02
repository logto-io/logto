import React from 'react';

import * as styles from './index.module.scss';

type Props = {
  type: 'sign-in' | 'register';
  channel: 'email' | 'phone';
};

const PasscodeValidation = ({ type, channel }: Props) => {
  console.log(type, channel);

  return <form className={styles.form}>{/* TODO */}</form>;
};

export default PasscodeValidation;
