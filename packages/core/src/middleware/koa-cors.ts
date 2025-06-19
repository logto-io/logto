import cors from '@koa/cors';
import type { UrlSet } from '@logto/shared';
import type { MiddlewareType } from 'koa';

import { EnvSet } from '#src/env-set/index.js';

/**
 * @fileoverview General-purpose CORS middleware for Logto APIs
 *
 * This middleware provides flexible CORS (Cross-Origin Resource Sharing) control for authenticated
 * and general-purpose APIs. It uses configurable URL Sets to determine allowed origins and supports
 * both strict and lenient policies based on environment and path configurations.
 *
 * **Use Cases:**
 * - Management APIs with authentication
 * - User APIs with authentication
 * - General endpoints that need flexible origin control
 * - APIs that serve multiple applications with different domains
 * - Development APIs that need permissive CORS policies
 *
 * **Key Features:**
 * - URL Set-based origin validation
 * - Path-based allowlist for specific endpoints
 * - Environment-aware policies (development vs production)
 * - Automatic localhost filtering in production for security
 * - Support for multiple endpoint configurations
 *
 * **Comparison with Anonymous CORS:**
 * - This middleware: Flexible, URL Set-based, suitable for authenticated APIs
 * - Anonymous CORS: Strict whitelist, domain suffix-based, for anonymous sensitive APIs
 *
 * @see {@link koaLogtoAnonymousOriginCors} and {@link koaLogtoAnonymousMethodsCors} for strict Logto anonymous API CORS handling
 */

/**
 * General-purpose CORS middleware factory
 *
 * Creates a flexible Koa CORS middleware that can handle various origin validation scenarios.
 * This middleware is built on top of @koa/cors and adds Logto-specific logic for URL Set
 * validation and environment-based security policies.
 *
 * **Features:**
 * - **URL Set Validation**: Validates origins against configured URL sets (admin, user, etc.)
 * - **Path-based Allowlist**: Certain paths can allow any origin when specified in allowedPrefixes
 * - **Environment Awareness**: More permissive in development, strict in production
 * - **Localhost Protection**: Automatically filters localhost in production for security
 * - **Multiple Endpoint Support**: Handles complex multi-domain scenarios
 *
 * **Usage Examples:**
 * ```typescript
 * // Basic usage with URL sets
 * app.use(koaCors([adminUrlSet, userUrlSet]));
 *
 * // With allowed prefixes for public APIs
 * app.use(koaCors([adminUrlSet], ['/api/public', '/health']));
 * ```
 *
 * **Security Behavior:**
 * - **Development**: Allows any origin for flexibility
 * - **Production**: Strict validation against URL sets, blocks localhost
 * - **Allowed Prefixes**: Override strict validation for specific paths
 *
 * @param urlSets - Array of UrlSet objects containing allowed origins
 * @param allowedPrefixes - Optional array of path prefixes that allow any origin
 * @returns Koa CORS middleware with Logto-specific origin validation
 *
 * @example
 * ```typescript
 * // For management APIs
 * managementRouter.use(koaCors([adminUrlSet, cloudUrlSet]));
 *
 * // For APIs with public endpoints
 * apiRouter.use(koaCors([userUrlSet], ['/account', '/verification']));
 * ```
 */
export default function koaCors<StateT, ContextT, ResponseBodyT>(
  urlSets: UrlSet[],
  allowedPrefixes: string[] = []
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return cors({
    origin: (ctx) => {
      const {
        headers: { origin },
        path,
      } = ctx.request;

      // Allow any origin if the path starts with an allowed prefix
      if (allowedPrefixes.some((prefix) => path.startsWith(prefix))) {
        return origin ?? '*';
      }

      if (!EnvSet.values.isProduction) {
        return origin ?? '';
      }

      if (
        origin &&
        urlSets.some((set) => {
          const deduplicated = set.deduplicated();

          // The URL Set has only one endpoint available, just use that endpoint.
          if (deduplicated.length <= 1) {
            return deduplicated.some((url) => url.origin === origin);
          }

          // For multiple endpoints, should filter out localhost in production.
          return deduplicated.some(
            (url) =>
              url.origin === origin &&
              // Disable localhost CORS in production since it's unsafe
              !(EnvSet.values.isProduction && url.hostname === 'localhost')
          );
        })
      ) {
        return origin;
      }

      return '';
    },
    exposeHeaders: '*',
  });
}
