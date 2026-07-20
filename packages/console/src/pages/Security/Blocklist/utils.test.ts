import {
  buildEmailBlocklistPolicyFormData,
  defaultBlockListPolicy,
  getEmailAllowlistWarnings,
} from './utils';

describe('Security Blocklist utils', () => {
  describe('defaultBlockListPolicy', () => {
    it('sets an empty custom allowlist by default', () => {
      expect(defaultBlockListPolicy.customAllowlist).toEqual([]);
    });
  });

  describe('buildEmailBlocklistPolicyFormData', () => {
    it('merges blocklist policy fields into the form data', () => {
      expect(
        buildEmailBlocklistPolicyFormData({
          emailBlocklistPolicy: {
            blockDisposableAddresses: true,
            blockSubaddressing: true,
            customAllowlist: ['@allowed.com'],
            customBlocklist: ['@blocked.com'],
          },
        })
      ).toEqual({
        blockDisposableAddresses: true,
        blockSubaddressing: true,
        customAllowlist: ['@allowed.com'],
        customBlocklist: ['@blocked.com'],
      });
    });

    it('fills default values when policy fields are missing from the response', () => {
      expect(
        buildEmailBlocklistPolicyFormData({
          emailBlocklistPolicy: {},
        })
      ).toEqual(defaultBlockListPolicy);
    });
  });

  describe('getEmailAllowlistWarnings', () => {
    it('returns no warnings when the allowlist is empty', () => {
      expect(
        getEmailAllowlistWarnings({
          customAllowlist: [],
          customBlocklist: ['@blocked.com'],
          blockSubaddressing: true,
        })
      ).toEqual([]);
    });

    it('detects identical allowlist and blocklist entries case-insensitively', () => {
      expect(
        getEmailAllowlistWarnings({
          customAllowlist: ['Foo@Example.com'],
          customBlocklist: ['foo@example.com'],
        })
      ).toEqual(['identical_entries', 'blocked_exact_email', 'effectively_unusable']);
    });

    it('detects exact allowlist emails matched by custom block rules', () => {
      expect(
        getEmailAllowlistWarnings({
          customAllowlist: ['foo@example.com'],
          customBlocklist: ['@example.com'],
        })
      ).toEqual(['blocked_exact_email', 'effectively_unusable']);
    });

    it('detects allowlist entries with plus signs when subaddressing is blocked', () => {
      expect(
        getEmailAllowlistWarnings({
          blockSubaddressing: true,
          customAllowlist: ['foo+bar@example.com'],
        })
      ).toEqual(['blocked_subaddressing', 'effectively_unusable']);
    });

    it('marks the allowlist effectively unusable only when every entry is cheaply blocked', () => {
      expect(
        getEmailAllowlistWarnings({
          customAllowlist: ['foo@example.com', '@allowed.com'],
          customBlocklist: ['@example.com'],
        })
      ).toEqual(['blocked_exact_email']);
    });

    it('does not perform expensive wildcard coverage checks', () => {
      expect(
        getEmailAllowlistWarnings({
          customAllowlist: ['@*.example.com'],
          customBlocklist: ['@example.com'],
        })
      ).toEqual([]);
    });
  });
});
