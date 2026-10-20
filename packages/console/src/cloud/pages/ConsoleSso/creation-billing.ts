import { type consoleSsoRouter } from '@logto/cloud/routes';
import type Client from '@withtyped/client';

import { type LogtoEnterpriseSubscriptionResponse } from '@/cloud/types/router';

import {
  clearPendingConnectorCreation,
  isPendingConnectorCreationCurrent,
  type PendingConnectorCreation,
  savePendingConnectorCreation,
} from './connector-creation-idempotency';

/** Match the contract's basic allowance; tenant plans and add-on totals do not grant coverage. */
export const getIncludedCapacity = (enterprise?: LogtoEnterpriseSubscriptionResponse) => {
  const limit = enterprise?.quota?.basicQuota.consoleSsoConnectorLimit;
  const used = enterprise?.usages?.consoleSsoConnectorLimit;
  const isEligible =
    enterprise?.quotaScope === 'shared' &&
    (enterprise.subscription?.status === 'active' ||
      enterprise.subscription?.status === 'trialing');
  return {
    isAvailable: Boolean(
      isEligible &&
        typeof used === 'number' &&
        (limit === null || (limit !== undefined && used < limit))
    ),
  };
};

type CreationFunding = {
  funding: 'included' | 'personal';
  subscriptionId?: string;
};

/** Keep billing selection fixed once a creation request may have reached the server. */
export const selectCreationFunding = (
  userId: string,
  operation: PendingConnectorCreation,
  funding: CreationFunding
) =>
  operation.funding
    ? operation
    : savePendingConnectorCreation(userId, { ...operation, ...funding });

const assertCurrentOperation = (userId: string, operation: PendingConnectorCreation) => {
  if (!isPendingConnectorCreationCurrent(userId, operation)) {
    throw new DOMException('Connector creation was replaced or cleared.', 'AbortError');
  }
};

/** Resume payment or fulfillment using the persisted intention, never a redirect's payment claim. */
export const continueConnectorCreation = async (
  userId: string,
  operation: PendingConnectorCreation,
  getApi: (key: string) => Client<typeof consoleSsoRouter>,
  { restartExpired, signal }: { restartExpired: boolean; signal?: AbortSignal }
) => {
  const assertCurrent = (current: PendingConnectorCreation) => {
    if (signal?.aborted) {
      throw new DOMException('Connector creation check was canceled.', 'AbortError');
    }
    assertCurrentOperation(userId, current);
  };
  assertCurrent(operation);
  const enroll = async (current: PendingConnectorCreation) => {
    const enrollment = await getApi(current.checkoutKey ?? current.key).post(
      '/api/me/console-sso/checkout-session',
      {
        body: { providerName: current.providerName },
      }
    );
    assertCurrent(current);
    return enrollment;
  };
  const getEnrollment = async () => {
    if (!operation.sessionId) {
      return { enrollment: await enroll(operation), current: operation };
    }
    const session = await getApi(operation.key).get(
      '/api/me/console-sso/checkout-session/:sessionId',
      {
        params: { sessionId: operation.sessionId },
      }
    );
    assertCurrent(operation);
    if (session.status !== 'expired' || !restartExpired) {
      return { enrollment: session, current: operation };
    }
    // A verified unpaid expiry ends this payment attempt, not the connector creation intention.
    const { sessionId, ...remaining } = operation;
    const current = savePendingConnectorCreation(userId, {
      ...remaining,
      checkoutKey: crypto.randomUUID(),
    });
    return { enrollment: await enroll(current), current };
  };
  const createConnector = async (current: PendingConnectorCreation) => {
    assertCurrent(current);
    const connector = await getApi(current.key).post('/api/me/console-sso/connectors', {
      body: {
        providerName: current.providerName,
        ...(current.subscriptionId && { stripeUserSubscriptionId: current.subscriptionId }),
      },
    });
    assertCurrent(current);
    return { status: 'created' as const, id: connector.id, operation: current };
  };
  if (operation.funding === 'included' || (operation.subscriptionId && !operation.sessionId)) {
    return createConnector(operation);
  }
  if (operation.funding !== 'personal') {
    throw new Error('Select a funding source before creating a connector.');
  }
  const { enrollment, current: enrollmentOperation } = await getEnrollment();
  assertCurrent(enrollmentOperation);
  if (enrollment.status === 'subscription_exists') {
    return createConnector(
      savePendingConnectorCreation(userId, {
        ...enrollmentOperation,
        subscriptionId: enrollment.subscriptionId,
      })
    );
  }
  // Persist before navigation or fulfillment. Only first enrollment has a Checkout session.
  const current = savePendingConnectorCreation(userId, {
    ...enrollmentOperation,
    sessionId: enrollment.sessionId,
    ...(enrollment.status === 'payment_received' &&
      enrollment.subscriptionId && {
        subscriptionId: enrollment.subscriptionId,
      }),
  });
  if (enrollment.status === 'payment_received') {
    // Checkout's webhook owns the first connector. Payment alone does not prove fulfillment.
    const connectors = current.subscriptionId
      ? await getApi(current.key).get('/api/me/console-sso/connectors')
      : [];
    assertCurrent(current);
    if (
      connectors.some(
        (connector) =>
          connector.stripeUserSubscriptionId === current.subscriptionId &&
          connector.providerName === current.providerName
      )
    ) {
      // Return to the refreshed list; Checkout does not identify a specific connector.
      return { status: 'created' as const, id: undefined, operation: current };
    }
    return { ...enrollment, status: 'payment_pending' as const, operation: current };
  }
  return { ...enrollment, operation: current };
};

/** Settle or expire the saved payment attempt before discarding a connector intention. */
export const abandonConnectorCreation = async (
  userId: string,
  operation: PendingConnectorCreation,
  getApi: (key: string) => Client<typeof consoleSsoRouter>
) => {
  assertCurrentOperation(userId, operation);
  const enrollment =
    operation.funding === 'personal' && !operation.sessionId && !operation.subscriptionId
      ? await getApi(operation.checkoutKey ?? operation.key).post(
          '/api/me/console-sso/checkout-session',
          {
            body: { providerName: operation.providerName },
          }
        )
      : undefined;
  assertCurrentOperation(userId, operation);
  const current =
    enrollment && enrollment.status !== 'subscription_exists'
      ? savePendingConnectorCreation(userId, { ...operation, sessionId: enrollment.sessionId })
      : operation;
  const settleSession = async () => {
    if (!current.sessionId) {
      return { current };
    }
    const session = await getApi(current.key).delete(
      '/api/me/console-sso/checkout-session/:sessionId',
      {
        params: { sessionId: current.sessionId },
      }
    );
    assertCurrentOperation(userId, current);
    return {
      session,
      current:
        session.status === 'payment_received' && session.subscriptionId
          ? savePendingConnectorCreation(userId, {
              ...current,
              subscriptionId: session.subscriptionId,
            })
          : current,
    };
  };
  const { session, current: settled } = await settleSession();
  assertCurrentOperation(userId, settled);
  if (session?.status === 'payment_pending' || session?.status === 'open') {
    return session;
  }
  await getApi(settled.key).delete('/api/me/console-sso/connector-creation');
  assertCurrentOperation(userId, settled);
  clearPendingConnectorCreation(userId);
  return { status: 'abandoned' as const };
};
