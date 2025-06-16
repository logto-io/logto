import cors from '@koa/cors';
import { ConsoleLog } from '@logto/shared';
import chalk from 'chalk';
import type { MiddlewareType } from 'koa';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';

/**
 * @fileoverview Anonymous CORS middleware for Logto APIs
 *
 * This middleware provides strict CORS (Cross-Origin Resource Sharing) control for anonymous APIs
 * that need to be accessible from specific Logto-related domains only. It implements a whitelist-based
 * approach to ensure only trusted origins can access sensitive anonymous endpoints.
 *
 * **Use Cases:**
 * - Other anonymous authentication endpoints
 * - Public APIs that should only be accessible from Logto-hosted websites
 * - Any anonymous endpoint requiring strict origin validation
 *
 * **Security Features:**
 * - Strict domain whitelist enforcement
 * - Development vs production environment handling
 * - Integration test environment support
 * - Automatic OPTIONS preflight request handling
 *
 * @see {@link koaCors} for general-purpose CORS handling with URL Sets
 */

const consoleLog = new ConsoleLog(chalk.magenta('anonymous-cors'));

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
  '.logto.io', // Production domain
  '.logto.dev', // Development domain
  ...(EnvSet.values.isDevFeaturesEnabled ? ['.logto-docs.pages.dev'] : []), // Logto Docs CI preview domain, for testing purposes
];

/**
 * Anonymous CORS middleware factory
 *
 * Creates a Koa middleware that enforces strict CORS policies for anonymous APIs.
 * This middleware is designed for endpoints that need to be accessible without authentication
 * but should be restricted to specific trusted domains only.
 *
 * **Features:**
 * - Automatic OPTIONS preflight request handling with 204 status
 * - Strict origin validation against predefined whitelists
 * - Environment-aware behavior (development vs production)
 * - Detailed error responses for unauthorized origins
 *
 * **Usage Example:**
 * ```typescript
 * router.get('/anonymous-api', koaAnonymousCors('GET, OPTIONS'), async (ctx) => {
 *   // Your anonymous API logic here
 * });
 * ```
 *
 * @param allowedMethods - Comma-separated string of allowed HTTP methods (e.g., 'GET, POST, OPTIONS')
 * @returns Koa middleware function for handling anonymous CORS
 *
 * @throws {RequestError} 403 Forbidden when request origin is not in the whitelist
 */
export default function koaAnonymousCors<StateT, ContextT, ResponseBodyT>(
  allowedMethods: string
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
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
      if (isProduction && productionDomainSuffixes.some((suffix) => origin.endsWith(suffix))) {
        return origin;
      }

      // Throw error for unauthorized origins
      throw new RequestError({ code: 'auth.forbidden', status: 403 });
    },
    allowMethods: allowedMethods.split(',').map((method) => method.trim()),
    allowHeaders: ['Content-Type'],
  });
}

// Export utilities for testing
export { localDevelopmentOrigins, productionDomainSuffixes };
