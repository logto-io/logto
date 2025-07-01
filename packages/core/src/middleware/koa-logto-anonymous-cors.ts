import cors from '@koa/cors';
import { ConsoleLog } from '@logto/shared';
import chalk from 'chalk';
import type { MiddlewareType } from 'koa';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';

/**
 * @fileoverview Logto Anonymous CORS middleware for Logto APIs
 *
 * This middleware provides strict CORS (Cross-Origin Resource Sharing) control for anonymous APIs
 * that need to be accessible from specific Logto-related domains only. It implements a whitelist-based
 * approach to ensure only trusted Logto origins can access sensitive anonymous endpoints.
 *
 * **Migration Guide:**
 * The CORS middleware has been split into two parts for better performance and modularity:
 *
 * **Recommended approach:**
 * ```typescript
 * // Apply origin validation at router level (once)
 * logtoAnonymousRouter.use(koaLogtoAnonymousOriginCors());
 *
 * // Apply method-specific CORS for each route
 * router.get('/api', koaLogtoAnonymousMethodsCors('GET'), async (ctx) => { ... });
 * ```
 *
 * **Use Cases:**
 * - Anonymous authentication endpoints that should only be accessible from Logto domains
 * - Public APIs that should only be accessible from Logto-hosted websites
 * - Any anonymous endpoint requiring strict Logto origin validation
 *
 * **Security Features:**
 * - Strict Logto domain whitelist enforcement
 * - Development vs production environment handling
 * - Integration test environment support
 * - Automatic OPTIONS preflight request handling
 *
 * @see {@link koaCors} for general-purpose CORS handling with URL Sets
 */

const consoleLog = new ConsoleLog(chalk.magenta('logto-anonymous-cors'));

// List of allowed local development origins
const localDevelopmentOrigins = [
  'localhost', // Localhost with any port
  '127.0.0.1', // IPv4 loopback
  '0.0.0.0', // All interfaces
  '[::1]', // IPv6 loopback
  '.local', // MDNS domains (especially for macOS)
  'host.docker.internal', // Docker host from container
];

// List of allowed production domain suffixes
const productionDomainSuffixes = [
  'logto.io', // Official website
  '.logto.io', // Production domain
  '.logto.dev', // Development domain
  ...(EnvSet.values.isDevFeaturesEnabled ? ['.logto-docs.pages.dev'] : []), // Logto Docs CI preview domain, for testing purposes
];

/**
 * Logto Anonymous Origin CORS middleware
 *
 * Creates a Koa middleware that enforces strict origin validation for anonymous APIs that should
 * only be accessible from Logto-related domains. This middleware only handles origin validation
 * and should be used together with koaLogtoAnonymousMethodsCors for complete CORS support.
 *
 * **Features:**
 * - Strict origin validation against predefined Logto domain whitelists
 * - Environment-aware behavior (development vs production)
 * - Detailed error responses for unauthorized origins
 *
 * **Usage Example:**
 * ```typescript
 * // Apply to router level for all routes
 * logtoAnonymousRouter.use(koaLogtoAnonymousOriginCors());
 *
 * // Then apply method-specific CORS for each route
 * router.get('/api', koaLogtoAnonymousMethodsCors('GET'), async (ctx) => {
 *   // Your API logic here
 * });
 * ```
 *
 * @returns Koa middleware function for handling Logto anonymous origin CORS
 *
 * @throws {RequestError} 403 Forbidden when request origin is not in the Logto whitelist
 */
export function koaLogtoAnonymousOriginCors<StateT, ContextT, ResponseBodyT>(): MiddlewareType<
  StateT,
  ContextT,
  ResponseBodyT
> {
  return cors({
    origin: (ctx) => {
      const origin = ctx.get('origin');
      const { isProduction, isIntegrationTest } = EnvSet.values;

      // Only show debug logs in non-production environments
      if (!isProduction) {
        consoleLog.info(`origin: ${origin}`);
        consoleLog.info(`isIntegrationTest: ${isIntegrationTest}`);
      }

      // Allow local development origins
      if (
        (!isProduction || isIntegrationTest) &&
        localDevelopmentOrigins.some((item) => origin.includes(item))
      ) {
        return origin;
      }

      // In production, only allow *.logto.io or *.logto.dev domains to access
      if (
        (isProduction || isIntegrationTest) &&
        productionDomainSuffixes.some((suffix) => origin.endsWith(suffix))
      ) {
        return origin;
      }

      // Throw error for unauthorized origins
      throw new RequestError({ code: 'auth.forbidden', status: 403 });
    },
    allowHeaders: ['Content-Type'],
    // Preflight request will be cached for 10 minutes
    maxAge: 600,
  });
}

/**
 * Logto Anonymous Methods CORS middleware
 *
 * Creates a Koa middleware that handles allowed HTTP methods for anonymous APIs.
 * This middleware should be used together with koaLogtoAnonymousOriginCors for complete CORS support.
 *
 * **Features:**
 * - Configurable allowed HTTP methods
 * - Automatic OPTIONS preflight request handling
 *
 * **Usage Example:**
 * ```typescript
 * // Apply origin CORS at router level
 * logtoAnonymousRouter.use(koaLogtoAnonymousOriginCors());
 *
 * // Apply method-specific CORS for each route
 * router.get('/config', koaLogtoAnonymousMethodsCors('GET'), async (ctx) => {
 *   // Your API logic here
 * });
 * ```
 *
 * @param allowedMethods - Comma-separated string of allowed HTTP methods (e.g., 'GET, POST')
 * @returns Koa middleware function for handling allowed methods CORS
 */
export function koaLogtoAnonymousMethodsCors<StateT, ContextT, ResponseBodyT>(
  allowedMethods: string
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return cors({
    allowMethods: allowedMethods.split(',').map((method) => method.trim()),
  });
}

// Export utilities for testing
export { localDevelopmentOrigins, productionDomainSuffixes };
