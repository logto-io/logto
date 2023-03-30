import { appInsights } from '@logto/app-insights/node.js';
import { tryThat } from '@silverhand/essentials';
import type { BaseContext, NextFunction } from '@withtyped/server';

/**
 * Build a middleware function that reports error to Azure Application Insights.
 */
export default function withErrorReport<InputContext extends BaseContext>() {
  return async (context: InputContext, next: NextFunction<InputContext>) => {
    await tryThat(next(context), (error) => {
      appInsights.trackException(error);
      throw error;
    });
  };
}
