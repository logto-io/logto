import { SignInIdentifier } from '@logto/schemas';

import { getInputHtmlProps } from './utils';

jest.mock('i18next', () => ({
  t: (key: string) => key,
}));

describe('Smart Input Field Util Methods', () => {
  const enabledTypes = [SignInIdentifier.Username, SignInIdentifier.Email, SignInIdentifier.Phone];

  describe('getInputHtmlProps', () => {
    it('Should return correct html props for phone', () => {
      const props = getInputHtmlProps([SignInIdentifier.Phone], SignInIdentifier.Phone);
      expect(props.type).toBe('tel');
      expect(props.pattern).toBe('[0-9]*');
      expect(props.inputMode).toBe('numeric');
      expect(props.label).toBe('input.phone_number');
      expect(props.autoComplete).toBe('tel');
    });

    it('Should return correct html props for email', () => {
      const props = getInputHtmlProps([SignInIdentifier.Email], SignInIdentifier.Email);
      expect(props.type).toBe('email');
      expect(props.inputMode).toBe('email');
      expect(props.label).toBe('input.email');
      expect(props.autoComplete).toBe('email');
    });

    it('Should return correct html props for username', () => {
      const props = getInputHtmlProps([SignInIdentifier.Username], SignInIdentifier.Username);
      expect(props.type).toBe('text');
      expect(props.label).toBe('input.username');
      expect(props.autoComplete).toBe('username');
    });

    it('Should return correct html props for username email or phone', () => {
      const props = getInputHtmlProps(enabledTypes, SignInIdentifier.Username);
      expect(props.type).toBe('text');
      expect(props.label).toBe('input.username / input.email / input.phone_number');
      expect(props.autoComplete).toBe('username email tel');
    });

    it('Should return correct html props for email or phone', () => {
      const props = getInputHtmlProps(
        [SignInIdentifier.Email, SignInIdentifier.Phone],
        SignInIdentifier.Email
      );
      expect(props.type).toBe('text');
      expect(props.label).toBe('input.email / input.phone_number');
      expect(props.autoComplete).toBe('email tel');
    });
  });
});
