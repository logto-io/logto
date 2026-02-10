import { type PasswordPolicy, passwordPolicyGuard } from '@logto/core-kit';
import { type DeepPartial } from '@silverhand/essentials';
import { z } from 'zod';

export enum LogResult {
  Success = 'Success',
  Error = 'Error',
}

// UAParser.js returns partial results, so all fields are optional
// Ref: https://docs.uaparser.dev/api/main/overview.html#methods
const uaParserBrowserGuard = z
  .object({
    name: z.string(),
    version: z.string(),
    major: z.string(),
    type: z.string(),
  })
  .partial()
  .catchall(z.unknown());

const uaParserDeviceGuard = z
  .object({
    model: z.string(),
    type: z.string(),
    vendor: z.string(),
  })
  .partial()
  .catchall(z.unknown());

const uaParserEngineGuard = z
  .object({
    name: z.string(),
    version: z.string(),
  })
  .partial()
  .catchall(z.unknown());

const uaParserOsGuard = z
  .object({
    name: z.string(),
    version: z.string(),
  })
  .partial()
  .catchall(z.unknown());

const uaParserCpuGuard = z
  .object({
    architecture: z.string(),
  })
  .partial()
  .catchall(z.unknown());

export const userAgentParsedGuard = z
  .object({
    ua: z.string(),
    browser: uaParserBrowserGuard,
    device: uaParserDeviceGuard,
    engine: uaParserEngineGuard,
    os: uaParserOsGuard,
    cpu: uaParserCpuGuard,
  })
  .partial()
  .catchall(z.unknown());

export const logContextPayloadGuard = z
  .object({
    key: z.string(),
    result: z.nativeEnum(LogResult),
    error: z.record(z.string(), z.unknown()).or(z.string()).optional(),
    ip: z.string().optional(),
    userAgent: z.string().optional(),
    userAgentParsed: userAgentParsedGuard.optional(),
    signInContext: z.record(z.string(), z.string()).optional(),
    userId: z.string().optional(),
    applicationId: z.string().optional(),
    sessionId: z.string().optional(),
    params: z.record(z.string(), z.unknown()).optional(),
  })
  .catchall(z.unknown());

export type PartialPasswordPolicy = DeepPartial<PasswordPolicy>;

export const partialPasswordPolicyGuard = passwordPolicyGuard.deepPartial();

/**
 * The basic log context type. It's more about a type hint instead of forcing the log shape.
 *
 * Note when setting up a log function, the type of log key in function arguments should be `LogKey`.
 * Here we use `string` to make it compatible with the Zod guard.
 **/
export type LogContextPayload = z.infer<typeof logContextPayloadGuard>;
