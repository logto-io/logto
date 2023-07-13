import type router from '@logto/cloud/routes';
import { type GuardedResponse, type RouterRoutes } from '@withtyped/client';

export type GetRoutes = RouterRoutes<typeof router>['get'];

export type SubscriptionPlanResponse = GuardedResponse<
  GetRoutes['/api/subscription-plans']
>[number];
