import { type consoleSsoRouter } from '@logto/cloud/routes';
import { ResponseError } from '@withtyped/client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  toastResponseError,
  tryReadResponseErrorBody,
  useCloudApi,
} from '@/cloud/hooks/use-cloud-api';
import { type ConsoleSsoConnector, type ConsoleSsoDomain } from '@/cloud/types/router';
import useCurrentUser from '@/hooks/use-current-user';

export type DomainError = {
  code?: string;
  message: string;
};

const checkInterval = 10_000;

/** Mirror Cloud's domain identity normalization; Cloud remains responsible for validation. */
export const normalizeDomain = (value: string) => value.trim().toLowerCase().replace(/\.$/, '');

export const getDomains = (data: ConsoleSsoConnector): ConsoleSsoDomain[] => [
  ...data.boundDomains.map((domain) => ({ domain, isBound: true as const })),
  ...data.domainVerifications
    .filter(({ domain }) => !data.boundDomains.some((bound) => bound.toLowerCase() === domain))
    .map((entry) => ({ ...entry, isBound: false as const })),
];

export const readDomainError = async (error: unknown): Promise<DomainError> => {
  if (error instanceof ResponseError) {
    const body = await tryReadResponseErrorBody(error);
    if (body) {
      return {
        message: body.message,
        ...(body.error?.code !== undefined && { code: body.error.code }),
      };
    }
  }
  return {
    message: error instanceof Error ? error.message : String(error),
  };
};

export const getPollDelay = (
  lastCheckedAt: ConsoleSsoConnector['domainVerifications'][number]['lastCheckedAt']
) => Math.max(checkInterval, (lastCheckedAt ?? 0) + checkInterval - Date.now());

type Props = {
  data: ConsoleSsoConnector;
  onUpdated: () => Promise<void>;
};

export const useDomainManager = ({ data, onUpdated }: Props) => {
  const { user } = useCurrentUser();
  const api = useCloudApi<typeof consoleSsoRouter>({ hideErrorToast: true });
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState<DomainError>();
  const [expanded, setExpanded] = useState<string>();
  const [localDomains, setLocalDomains] = useState<Record<string, ConsoleSsoDomain>>({});
  const [removed, setRemoved] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, DomainError>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [checking, setChecking] = useState<string>();
  const [deleting, setDeleting] = useState<string>();
  const requestEpoch = useRef(0);
  const inFlight = useRef(false);

  useEffect(() => {
    setExpanded(undefined);
    setLocalDomains({});
    setRemoved([]);
    setErrors({});
    setInput('');
    setInputError(undefined);
    return () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Invalidate in-flight requests when ownership changes or this page unmounts.
      requestEpoch.current += 1;
    };
  }, [data.id, user?.id]);

  const domains = useMemo(() => {
    const authoritative = getDomains(data);
    const merged = new Map(authoritative.map((domain) => [domain.domain, domain]));
    for (const [domain, status] of Object.entries(localDomains)) {
      if (!merged.get(domain)?.isBound) {
        merged.set(domain, status);
      }
    }
    return [...merged.values()].filter(({ domain }) => !removed.includes(domain));
  }, [data, localDomains, removed]);

  const active = domains.find(({ domain }) => domain === expanded);
  const activeVerification = data.domainVerifications.find(
    ({ domain }) => domain === active?.domain
  );

  const refreshDomain = useCallback(
    async (domain: string, epoch: number) => {
      try {
        const status = await api.get(
          '/api/me/console-sso/connectors/:connectorId/domains/:domain',
          {
            params: { connectorId: data.id, domain: encodeURIComponent(domain) },
          }
        );
        if (requestEpoch.current === epoch) {
          setLocalDomains((current) => ({ ...current, [domain]: status }));
        }
      } catch (error) {
        if (
          requestEpoch.current === epoch &&
          error instanceof ResponseError &&
          error.status === 404
        ) {
          setRemoved((current) => [...current, domain]);
          setExpanded(undefined);
        }
      }
    },
    [api, data.id]
  );

  const verify = useCallback(
    async (domain: string) => {
      if (inFlight.current) {
        return;
      }
      // eslint-disable-next-line @silverhand/fp/no-mutation -- The ref prevents overlapping timer requests.
      inFlight.current = true;
      const epoch = requestEpoch.current;
      setChecking(domain);
      try {
        const status = await api.post(
          '/api/me/console-sso/connectors/:connectorId/domains/:domain/verify',
          { params: { connectorId: data.id, domain: encodeURIComponent(domain) } }
        );
        if (requestEpoch.current === epoch) {
          setLocalDomains((current) => ({ ...current, [domain]: status }));
          setErrors((current) => {
            const { [domain]: _, ...rest } = current;
            return rest;
          });
          if (status.isBound || status.verifiedAt !== null) {
            await onUpdated();
          }
        }
      } catch (error) {
        if (requestEpoch.current === epoch) {
          const detail = await readDomainError(error);
          setErrors((current) => ({ ...current, [domain]: detail }));
          await refreshDomain(domain, epoch);
          await onUpdated();
        }
      } finally {
        // eslint-disable-next-line @silverhand/fp/no-mutation -- Release the in-flight guard after either response.
        inFlight.current = false;
        setChecking(undefined);
      }
    },
    [api, data.id, onUpdated, refreshDomain]
  );

  useEffect(() => {
    if (!active || (active.isBound && !activeVerification) || deleting !== undefined || checking) {
      return;
    }
    const timer = window.setTimeout(
      () => {
        void verify(active.domain);
      },
      getPollDelay(
        active.isBound ? (activeVerification?.lastCheckedAt ?? null) : active.lastCheckedAt
      )
    );
    return () => {
      window.clearTimeout(timer);
    };
  }, [active, activeVerification, checking, deleting, verify]);

  const add = async () => {
    const domain = normalizeDomain(input);
    if (domain.length === 0 || isAdding) {
      return;
    }
    const epoch = requestEpoch.current;
    setIsAdding(true);
    setInputError(undefined);
    try {
      const status = await api.post('/api/me/console-sso/connectors/:connectorId/domains', {
        params: { connectorId: data.id },
        body: { domain },
      });
      if (requestEpoch.current === epoch) {
        setLocalDomains((current) => ({ ...current, [status.domain]: status }));
        setRemoved((current) => current.filter((value) => value !== status.domain));
        setExpanded(status.domain);
        setInput('');
        await onUpdated();
      }
    } catch (error) {
      if (requestEpoch.current === epoch) {
        setInputError(await readDomainError(error));
        await onUpdated();
      }
    } finally {
      setIsAdding(false);
    }
  };

  const toggle = (domain: string) => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Invalidate a verification response from the previous expanded card.
    requestEpoch.current += 1;
    const next = expanded === domain ? undefined : domain;
    setExpanded(next);
    if (next) {
      void refreshDomain(domain, requestEpoch.current);
    }
  };

  const remove = async (domain: string) => {
    if (deleting) {
      return;
    }
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Stop polling and ignore an older verification response before deletion.
    requestEpoch.current += 1;
    const epoch = requestEpoch.current;
    setExpanded(undefined);
    setDeleting(domain);
    try {
      await api.delete('/api/me/console-sso/connectors/:connectorId/domains/:domain', {
        params: { connectorId: data.id, domain: encodeURIComponent(domain) },
      });
      if (requestEpoch.current === epoch) {
        setRemoved((current) => [...current, domain]);
        setLocalDomains((current) => {
          const { [domain]: _, ...rest } = current;
          return rest;
        });
        await onUpdated();
      }
    } catch (error) {
      if (requestEpoch.current === epoch) {
        await onUpdated();
        await toastResponseError(error);
      }
    } finally {
      setDeleting(undefined);
    }
  };

  return {
    domains,
    input,
    setInput: (value: string) => {
      setInput(value);
      setInputError(undefined);
    },
    inputError,
    expanded,
    errors,
    isAdding,
    checking,
    deleting,
    add,
    toggle,
    remove,
  };
};
