/**
 * @file SSRF protection for outbound requests whose target is operator- or tenant-supplied
 * (webhooks, SSO connector discovery, IdP metadata).
 *
 * oidc-provider already guards its own outgoing requests this way; this module reuses the exact
 * same primitives so both surfaces share one classifier and one enablement switch, instead of
 * maintaining a second IP range list that could drift.
 *
 * The check runs when the connection is established, against the address the socket is actually
 * bound to, rather than resolving the hostname up front and then handing the URL to the HTTP
 * client. An up-front lookup is a TOCTOU: the client resolves the name again independently and can
 * get a different answer (DNS rebinding, round robin, short TTL). Inspecting the connected socket
 * closes that window, and it covers a literal IP host, a hostname that resolves to a special-use
 * address, and every redirect hop -- each hop opens its own connection and is checked again.
 */

import http from 'node:http';
import https from 'node:https';
import { BlockList, isIP, type Socket } from 'node:net';

import { cond, type Optional } from '@silverhand/essentials';
import { got, type Got } from 'got';
import { isSpecialUseIP } from 'oidc-provider/lib/helpers/fetch_request.js';

import { EnvSet } from '#src/env-set/index.js';
import assertThat from '#src/utils/assert-that.js';

/** Memoizes a factory, so the shared resources below are built at most once. */
const once = <T>(build: () => T): (() => T) => {
  const cache = new Map<'value', T>();

  return () => {
    if (!cache.has('value')) {
      cache.set('value', build());
    }

    // eslint-disable-next-line no-restricted-syntax -- guarded by the `has` check above
    return cache.get('value') as T;
  };
};

const blockedAddressMessage = 'hostname resolves to a special-use IP address';

/** Undici emits `connect` with the `[Agent, Pool, Client]` chain; the socket lives on the client. */
type DispatcherConnectListener = (origin: unknown, targets: readonly unknown[]) => void;

/** The slice of the undici `Dispatcher` surface this module uses; see {@link getUndiciAgent}. */
type DispatcherEmitter = {
  on: (event: string, listener: DispatcherConnectListener) => void;
};

/**
 * Comma-separated allowlist of otherwise-blocked destinations, as IP addresses or CIDR ranges
 * (`127.0.0.1,10.0.0.0/8,::1`).
 *
 * This is the narrow escape hatch for deployments that must deliver to a known internal host. It
 * is preferable to turning the protection off entirely: naming the destinations keeps every other
 * special-use address, including the cloud metadata endpoint, blocked. Ignored in Cloud.
 */
const parseAllowedAddresses = (): Optional<BlockList> => {
  const raw = EnvSet.values.ssrfAllowedAddresses;

  if (raw.length === 0) {
    return undefined;
  }

  const list = new BlockList();

  for (const entry of raw) {
    const [address, prefix] = entry.split('/');

    // Silently skipping a malformed entry would leave the operator believing a host is reachable.
    assertThat(
      address && isIP(address),
      new Error(`Invalid address in \`SSRF_ALLOWED_ADDRESSES\`: ${entry}`)
    );

    const family = isIP(address) === 6 ? 'ipv6' : 'ipv4';

    if (prefix === undefined) {
      list.addAddress(address, family);
    } else {
      list.addSubnet(address, Number(prefix), family);
    }
  }

  return list;
};

/** Parsing is cached against the configured value, which is fixed for the process' lifetime. */
const allowedAddressesCache = new Map<string, Optional<BlockList>>();

const getAllowedAddresses = (): Optional<BlockList> => {
  const key = EnvSet.values.ssrfAllowedAddresses.join(',');

  if (!allowedAddressesCache.has(key)) {
    allowedAddressesCache.set(key, parseAllowedAddresses());
  }

  return allowedAddressesCache.get(key);
};

/** Whether the peer is explicitly allowed despite being a special-use address. */
const isAllowedAddress = (address: string): boolean => {
  const allowed = getAllowedAddresses();

  return allowed?.check(address, isIP(address) === 6 ? 'ipv6' : 'ipv4') ?? false;
};

/**
 * Destroys the socket once connected if its peer is a special-use address. Mirrors the guard
 * oidc-provider installs on its undici dispatcher, for the `node:http` agents that `got` uses.
 *
 * Exported for testing: this is the enforcement point for every `got` request.
 */
export const guardSocket = <T extends Socket>(socket: T): T => {
  const assertPublicPeer = () => {
    const { remoteAddress } = socket;

    if (
      remoteAddress !== undefined &&
      isSpecialUseIP(remoteAddress) &&
      !isAllowedAddress(remoteAddress)
    ) {
      socket.destroy(new Error(blockedAddressMessage));
    }
  };

  if (socket.connecting) {
    socket.once('connect', assertPublicPeer);
  } else {
    assertPublicPeer();
  }

  return socket;
};

/**
 * `Agent.createConnection()` is the documented socket factory both agents use, but it is missing
 * from `@types/node`'s `Agent` declaration, so the base implementation has to be reached through a
 * typed view of the prototype.
 *
 * @see https://nodejs.org/api/http.html#agentcreateconnectionoptions-callback
 */
type ConnectionOptions = Record<string, unknown>;

type ConnectionFactory = {
  createConnection: (options: ConnectionOptions, callback?: unknown) => Socket;
};

const asConnectionFactory = (agent: http.Agent | https.Agent): ConnectionFactory =>
  // eslint-disable-next-line no-restricted-syntax -- see `ConnectionFactory`
  agent as unknown as ConnectionFactory;

class SsrfProtectedHttpAgent extends http.Agent {
  createConnection(options: ConnectionOptions, callback?: unknown): Socket {
    return guardSocket(
      asConnectionFactory(http.Agent.prototype).createConnection.call(this, options, callback)
    );
  }
}

class SsrfProtectedHttpsAgent extends https.Agent {
  createConnection(options: ConnectionOptions, callback?: unknown): Socket {
    return guardSocket(
      asConnectionFactory(https.Agent.prototype).createConnection.call(this, options, callback)
    );
  }
}

/**
 * Whether outbound requests to operator-supplied URLs are guarded.
 *
 * Shares the switch with oidc-provider's protection: always on in Cloud, where a tenant admin must
 * never reach the infrastructure's private network, and opt-out only for self-hosted deployments
 * that legitimately deliver webhooks to hosts on their own network.
 */
const isEnabled = () => EnvSet.values.isSsrfProtectionEnabled;

/**
 * `undici` `Agent` constructor, taken from the global dispatcher the way oidc-provider does, so the
 * dispatcher is built from the same bundled `undici` that the global `fetch` dispatches through.
 * Mixing an `undici` copy from `node_modules` with node's bundled one yields incompatible
 * `Dispatcher` instances.
 */
const getUndiciAgent = (): Optional<new () => DispatcherEmitter> => {
  // Referencing `Response` triggers node's lazy `undici` initialization that sets these symbols.
  void Response;

  // eslint-disable-next-line no-restricted-syntax -- internal `undici` symbols are untyped
  const globals = globalThis as Record<
    symbol,
    Optional<{ constructor?: new () => DispatcherEmitter }>
  >;
  const globalDispatcher =
    globals[Symbol.for('undici.globalDispatcher.2')] ??
    globals[Symbol.for('undici.globalDispatcher.1')];

  return globalDispatcher?.constructor;
};

/**
 * The socket an undici client holds is stored under a symbol-keyed property, the way
 * oidc-provider's own guard reaches it.
 */
const findSocket = (target: unknown): Optional<Socket> => {
  if (typeof target !== 'object' || target === null) {
    return undefined;
  }

  const socketKey = Object.getOwnPropertySymbols(target).find(
    (key) => key.description === 'socket'
  );

  // eslint-disable-next-line no-restricted-syntax -- reaching into undici internals by symbol
  return socketKey === undefined ? undefined : (target as Record<symbol, Socket>)[socketKey];
};

/**
 * Applies the same guard as {@link guardSocket} to an undici dispatcher.
 *
 * oidc-provider's `applySSRFProtection` is not reused here because it hardcodes its own check and
 * offers no hook for the allowlist, which would leave `SSRF_ALLOWED_ADDRESSES` silently ignored on
 * the `fetch` path while working on the `got` one.
 */
const applyDispatcherGuard = <T extends DispatcherEmitter>(dispatcher: T): T => {
  dispatcher.on('connect', (_origin, targets) => {
    const socket = findSocket(targets.at(-1));

    if (socket) {
      guardSocket(socket);
    }
  });

  return dispatcher;
};

/** Built once and shared: a dispatcher per request would leak connection pools. */
const getDispatcher = once((): unknown => {
  const Agent = getUndiciAgent();

  // The symbols are absent outside a normal node runtime, e.g. inside a Jest VM context. Failing
  // loudly matters here: a missing dispatcher silently downgrades every webhook to unprotected.
  assertThat(
    Agent,
    new Error(
      'Failed to set up SSRF protection for outbound requests: the `undici` global dispatcher is unavailable.'
    )
  );

  return applyDispatcherGuard(new Agent());
});

/**
 * Drop-in `fetch` that routes through the SSRF-protected dispatcher.
 *
 * `ky` 1.2.3 lists `dispatcher` in its request options registry and silently drops it, so passing
 * the dispatcher to `ky` directly has no effect (fixed upstream in ky 1.14.4, see
 * https://github.com/sindresorhus/ky/pull/757). Injecting `fetch` is the supported seam until then.
 */
export const ssrfProtectedFetch: typeof fetch = async (input, init) => {
  if (!isEnabled()) {
    return fetch(input, init);
  }

  // eslint-disable-next-line no-restricted-syntax -- the `dispatcher` key is an undici extension absent from `RequestInit`
  return fetch(input, { ...init, dispatcher: getDispatcher() } as RequestInit);
};

/** Lazily built so the pools only exist once something actually dials out. */
const getAgents = once(() => ({
  http: new SsrfProtectedHttpAgent(),
  https: new SsrfProtectedHttpsAgent(),
}));

/**
 * `got`'s `agent` option, guarding both protocols. Both must be set: covering only one leaves a
 * cross-protocol redirect (`https:` -> `http:`) unguarded.
 */
const getSsrfProtectedAgent = () => cond(isEnabled() && getAgents());

/**
 * `got` bound to the SSRF-protected agents. Use it in place of `got` for any request whose URL
 * comes from a connector config or another operator-supplied value.
 *
 * The agents are attached per request rather than baked into the instance, so the module stays
 * import-order independent: `EnvSet.values` does not have to be loaded when this module is.
 *
 * `beforeRequest` rather than `init`: an `init` hook receives the instance's own options object, so
 * assigning there mutates the shared defaults and the agents would stay attached to every later
 * request even once the protection is switched off.
 */
export const ssrfProtectedGot: Got = got.extend({
  hooks: {
    beforeRequest: [
      (options) => {
        const agent = getSsrfProtectedAgent();

        if (agent) {
          // eslint-disable-next-line @silverhand/fp/no-mutation -- `got`'s documented hook contract
          options.agent = agent;
        }
      },
    ],
  },
});
