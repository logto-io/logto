import type router from '@logto/cloud/routes';
import { type RouterRoutes } from '@withtyped/client';
import { type z, type ZodType } from 'zod';

export type GetRoutes = RouterRoutes<typeof router>['get'];

type RouteResponseType<T extends { search?: unknown; body?: unknown; response?: ZodType }> =
  z.infer<NonNullable<T['response']>>;

export type SubscriptionPlanResponse = RouteResponseType<
  GetRoutes['/api/subscription-plans']
>[number];
