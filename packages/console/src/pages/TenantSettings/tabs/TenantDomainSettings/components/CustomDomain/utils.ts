import { DomainStatus } from '@logto/schemas';
import { z } from 'zod';

// TODO @xiaoyijun Remove this type assertion when the LOG-6276 issue is done by @wangsijie
export const isDomainStatus = (value: string): value is DomainStatus =>
  z.nativeEnum(DomainStatus).safeParse(value).success;
