import { type consoleSsoRouter } from '@logto/cloud/routes';
import type Client from '@withtyped/client';
import { ResponseError } from '@withtyped/client';

import { tryReadResponseErrorBody } from '@/cloud/hooks/use-cloud-api';
import {
  type CheckoutCustomerChoice,
  type LogtoEnterpriseSubscriptionResponse,
} from '@/cloud/types/router';

import {
  clearPendingConnectorCreation,
  isPendingConnectorCreationCurrent,
  type PendingConnectorCreation,
  savePendingConnectorCreation,
} from './connector-creation-idempotency';

/** Only an active or trialing shared Enterprise plan grants Console SSO coverage. */
const isEnterpriseCoverageEligible = (enterprise?: LogtoEnterpriseSubscriptionResponse) =>
  enterprise?.quotaScope === 'shared' &&
  (enterprise.subscription?.status === 'active' || enterprise.subscription?.status === 'trialing');

/** Match the contract's basic allowance; tenant plans and add-on totals do not grant coverage. */
export const getIncludedCapacity = (enterprise?: LogtoEnterpriseSubscriptionResponse) => {
  const limit = enterprise?.quota?.basicQuota.consoleSsoConnectorLimit;
  const used = enterprise?.usages?.consoleSsoConnectorLimit;
  return {
    isAvailable: Boolean(
      isEnterpriseCoverageEligible(enterprise) &&
        typeof used === 'number' &&
        (limit === null || (limit !== undefined && used < limit))
    ),
  };
};

type CreationFunding = {
  funding: 'included' | 'personal';
  subscriptionId?: string;
  /** The Enterprise whose allowance funds an included connector. */
  enterpriseId?: string;
};

/** Keep billing selection fixed once a creation request may have reached the server. */
export const selectCreationFunding = (
  userId: string,
  operation: PendingConnectorCreation,
  funding: CreationFunding
) => {
  if (operation.funding) {
    return operation;
  }
  if (funding.funding === 'included' && !funding.enterpriseId) {
    throw new Error('Select an Enterprise before creating a connector.');
  }
  return savePendingConnectorCreation(userId, { ...operation, ...funding });
};

const assertCurrentOperation = (userId: string, operation: PendingConnectorCreation) => {
  if (!isPendingConnectorCreationCurrent(userId, operation)) {
    throw new DOMException('Connector creation was replaced or cleared.', 'AbortError');
  }
};

const requestConnectorCreation = async (
  operation: PendingConnectorCreation,
  api: Client<typeof consoleSsoRouter>
) => {
  const { providerName, enterpriseId, subscriptionId } = operation;
  if (operation.funding === 'included') {
    // Older pending operations lack an Enterprise selector; keep them for explicit cleanup.
    if (!enterpriseId) {
      throw new Error('Start over to select an Enterprise for this connector.');
    }
    return api.post('/api/me/logto-enterprises/:id/console-sso/connectors', {
      params: { id: enterpriseId },
      body: { providerName },
    });
  }
  if (!subscriptionId) {
    throw new Error('A personal subscription is required to create a connector.');
  }
  return api.post('/api/me/console-sso/connectors', {
    body: { providerName, stripeUserSubscriptionId: subscriptionId },
  });
};

/** Checkout refused the chosen billing Customer, so no session exists for this Checkout key. */
const isRefusedCustomerChoice = async (error: unknown) => {
  if (!(error instanceof ResponseError)) {
    return false;
  }
  const body = await tryReadResponseErrorBody(error);
  const code = body?.error?.code;
  return code === 'customer_not_found' || code === 'customer_unavailable';
};

/** A dialog canceled before the first Checkout key was used left no server state, so start clean. */
export const discardCanceledConnectorCreation = (
  userId: string,
  operation: PendingConnectorCreation
) => {
  if (!operation.checkoutKey) {
    clearPendingConnectorCreation(userId);
  }
};

const postCheckoutSession = async (
  operation: PendingConnectorCreation,
  getApi: (key: string) => Client<typeof consoleSsoRouter>
) =>
  getApi(operation.checkoutKey ?? operation.key).post('/api/me/console-sso/checkout-session', {
    body: { providerName: operation.providerName, ...operation.customerChoice },
  });

/** Resume payment or fulfillment using the persisted intention, never a redirect's payment claim. */
export const continueConnectorCreation = async (
  userId: string,
  operation: PendingConnectorCreation,
  getApi: (key: string) => Client<typeof consoleSsoRouter>,
  {
    restartExpired,
    signal,
    chooseBillingCustomer,
  }: {
    restartExpired: boolean;
    signal?: AbortSignal;
    /** Resolves to `undefined` when the user cancels. */
    chooseBillingCustomer: () => Promise<CheckoutCustomerChoice | undefined>;
  }
) => {
  const assertCurrent = (current: PendingConnectorCreation) => {
    if (signal?.aborted) {
      throw new DOMException('Connector creation check was canceled.', 'AbortError');
    }
    assertCurrentOperation(userId, current);
  };
  assertCurrent(operation);
  /** Ask once per Checkout key, and save the choice before any request can send it. */
  const withCustomerChoice = async (current: PendingConnectorCreation) => {
    if (current.customerChoice) {
      return current;
    }
    const customerChoice = await chooseBillingCustomer();
    assertCurrent(current);
    return customerChoice && savePendingConnectorCreation(userId, { ...current, customerChoice });
  };
  const enroll = async (pending: PendingConnectorCreation) => {
    // An add-on to an existing subscription bills that subscription's Customer, so skip asking.
    if (!pending.customerChoice) {
      const preview = await getApi(pending.key)
        .get('/api/me/console-sso/checkout-preview')
        .catch((error: unknown) => {
          // A first attempt has only read the preview, so there is no server state to recover.
          if (!pending.checkoutKey && isPendingConnectorCreationCurrent(userId, pending)) {
            clearPendingConnectorCreation(userId);
          }
          throw error;
        });
      assertCurrent(pending);
      if (preview.status === 'subscription_exists') {
        return { enrollment: preview, current: pending };
      }
    }
    const current = await withCustomerChoice(pending);
    if (!current) {
      return { enrollment: undefined, current: pending };
    }
    try {
      const enrollment = await postCheckoutSession(current, getApi);
      assertCurrent(current);
      return { enrollment, current };
    } catch (error) {
      if (await isRefusedCustomerChoice(error)) {
        // The choice is not part of the purchase key, so choosing again needs a new Checkout key.
        assertCurrent(current);
        const { customerChoice, ...remaining } = current;
        savePendingConnectorCreation(userId, {
          ...remaining,
          checkoutKey: crypto.randomUUID(),
        });
      }
      throw error;
    }
  };
  const getEnrollment = async () => {
    if (!operation.sessionId) {
      return enroll(operation);
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
    return enroll(current);
  };
  const createConnector = async (current: PendingConnectorCreation) => {
    assertCurrent(current);
    const connector = await requestConnectorCreation(current, getApi(current.key));
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
  if (!enrollment) {
    // Canceling the billing account dialog sends nothing for this Checkout key.
    return { status: 'canceled' as const, operation: enrollmentOperation };
  }
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
  const findLostEnrollment = async () => {
    try {
      return await postCheckoutSession(operation, getApi);
    } catch (error) {
      if (await isRefusedCustomerChoice(error)) {
        return;
      }
      throw error;
    }
  };
  // Only a saved billing choice means a Checkout request may have been sent and its response lost.
  const enrollment =
    operation.customerChoice && !operation.sessionId && !operation.subscriptionId
      ? await findLostEnrollment()
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
