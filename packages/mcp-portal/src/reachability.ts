import { type Upstream } from './registry.js';
import { type UpstreamPool } from './upstream-pool.js';

const reachabilityTimeoutMs = 10_000;

/** Connects and lists tools once, so the console can show Ready or an error when a server is added. */
export const checkReachable = async (pool: UpstreamPool, upstream: Upstream): Promise<boolean> => {
  const timeout = new Promise<never>((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error('timed out'));
    }, reachabilityTimeoutMs).unref();
  });

  try {
    const client = await Promise.race([pool.get(upstream), timeout]);
    await Promise.race([client.listTools(), timeout]);
    return true;
  } catch {
    await pool.invalidate(upstream);
    return false;
  }
};
