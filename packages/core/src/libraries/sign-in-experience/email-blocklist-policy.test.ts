import RequestError from '../../errors/RequestError/index.js';

import { validateEmailBlocklistPolicy } from './email-blocklist-policy.js';

const invalidCustomBlockList = ['bar', 'bar@foo', '@foo', '@foo.', 'bar@foo.'];
const validCustomBlockList = ['bar@foo.com', '@foo.com', 'abc.bar@foo.xyz'];

describe('validateEmailBlocklistPolicy', () => {
  it.each(invalidCustomBlockList)(
    'should throw error for invalid custom block list item: %s',
    (item) => {
      const emailBlocklistPolicy = { customBlocklist: [item] };
      expect(() => {
        validateEmailBlocklistPolicy(emailBlocklistPolicy);
      }).toMatchError(
        new RequestError({
          code: 'sign_in_experiences.invalid_custom_email_blocklist_format',
          items: Array.from([item]),
          status: 400,
        })
      );
    }
  );

  it('should throw if duplicate custom email blocklist items is detected', () => {
    expect(() => {
      validateEmailBlocklistPolicy({ customBlocklist: ['bar@foo.com', 'bar@foo.com'] });
    }).toMatchError(new RequestError('sign_in_experiences.duplicate_custom_email_blocklist_items'));
  });

  it('should pass the validation with valid format', () => {
    expect(() => {
      validateEmailBlocklistPolicy({ customBlocklist: validCustomBlockList });
    }).not.toThrow();
  });
});
