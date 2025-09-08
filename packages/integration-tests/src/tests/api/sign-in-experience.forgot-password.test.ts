import { ForgotPasswordMethod, ConnectorType } from '@logto/schemas';

import { updateSignInExperience } from '#src/api/index.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { expectRejects } from '#src/helpers/index.js';

describe('forgot password methods', () => {
  afterEach(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
  });

  it('should update forgot password methods successfully', async () => {
    await Promise.all([setEmailConnector(), setSmsConnector()]);

    const forgotPasswordMethods = [
      ForgotPasswordMethod.EmailVerificationCode,
      ForgotPasswordMethod.PhoneVerificationCode,
    ];

    const result = await updateSignInExperience({
      forgotPasswordMethods,
    });

    expect(result.forgotPasswordMethods).toEqual(forgotPasswordMethods);
  });

  it('should reject email forgot password method when no email connector exists', async () => {
    await clearConnectorsByTypes([ConnectorType.Email]);

    await expectRejects(
      updateSignInExperience({
        forgotPasswordMethods: [ForgotPasswordMethod.EmailVerificationCode],
      }),
      {
        code: 'sign_in_experiences.forgot_password_method_requires_connector',
        status: 400,
      }
    );
  });

  it('should reject phone forgot password method when no SMS connector exists', async () => {
    await clearConnectorsByTypes([ConnectorType.Sms]);

    await expectRejects(
      updateSignInExperience({
        forgotPasswordMethods: [ForgotPasswordMethod.PhoneVerificationCode],
      }),
      {
        code: 'sign_in_experiences.forgot_password_method_requires_connector',
        status: 400,
      }
    );
  });
});
