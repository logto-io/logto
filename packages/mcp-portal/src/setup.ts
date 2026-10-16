import { randomBytes, timingSafeEqual } from 'node:crypto';

import { type SettingsStore } from './settings.js';

export type SetupResult = 'pending' | 'completed' | 'already-configured' | 'invalid-token';

type SetupState = {
  /** Confirmed secret, saved permanently. */
  secret?: string;
  /** Secret from the latest setup call, not yet confirmed. Replaced by any later setup call. */
  pending?: string;
  /** One-time token printed at first start. Valid until setup is confirmed. */
  token?: string;
};

const secretsMatch = (provided: string, expected: string): boolean => {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);

  return left.length === right.length && timingSafeEqual(left, right);
};

/**
 * Holds the internal secret that Logto core uses to reach the portal.
 *
 * Setup is two steps so a failure in between can be retried with the same token:
 * 1. `complete` (POST /setup) holds the secret as pending. Calling it again replaces the pending secret.
 * 2. `confirm` (POST /setup/confirm) saves the secret permanently and retires the token.
 *
 * The internal channel accepts the pending secret too, so requests keep working if confirm fails.
 */
export class PortalSetup {
  static async create(store: SettingsStore): Promise<PortalSetup> {
    const settings = await store.load();
    const token = settings.internalSecret ? undefined : randomBytes(24).toString('base64url');

    return new PortalSetup(store, { secret: settings.internalSecret, token });
  }

  private constructor(
    private readonly store: SettingsStore,
    private readonly state: SetupState
  ) {}

  /** The secret that verifies core's internal channel. Undefined until setup has been started. */
  internalSecret(): string | undefined {
    return this.state.secret ?? this.state.pending;
  }

  /** Printed at startup while unconfigured, so the admin can enter it in the console. */
  pendingToken(): string | undefined {
    return this.state.token;
  }

  async complete(token: string, secret: string): Promise<SetupResult> {
    if (this.state.secret) {
      return 'already-configured';
    }

    if (!this.state.token || !secretsMatch(token, this.state.token)) {
      return 'invalid-token';
    }

    // Holds the secret in memory only. The confirmed secret is what gets saved.

    this.state.pending = secret;

    return 'pending';
  }

  async confirm(token: string, secret: string): Promise<SetupResult> {
    if (this.state.secret) {
      return 'already-configured';
    }

    if (
      !this.state.token ||
      !this.state.pending ||
      !secretsMatch(token, this.state.token) ||
      !secretsMatch(secret, this.state.pending)
    ) {
      return 'invalid-token';
    }

    await this.store.saveInternalSecret(secret);

    // One-time state change: setup completes exactly once, and the token is then discarded.

    this.state.secret = secret;

    this.state.pending = undefined;

    this.state.token = undefined;

    return 'completed';
  }

  /**
   * Clears the confirmed and pending secrets, and issues a new one-time token. Only callers that
   * present the current internal secret can reach this, through the internal channel.
   */
  async reset(): Promise<string> {
    await this.store.clear();

    this.state.secret = undefined;

    this.state.pending = undefined;

    const token = randomBytes(24).toString('base64url');

    this.state.token = token;

    return token;
  }
}
