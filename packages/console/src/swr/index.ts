import { RequestErrorMetadata } from '@logto/schemas';
import { BareFetcher } from 'swr';

export class RequestError extends Error {
  metadata: RequestErrorMetadata;

  constructor(metadata: RequestErrorMetadata) {
    super('Request error occurred.');
    this.metadata = metadata;
  }
}

export const fetcher: BareFetcher = async (resource, init) => {
  const response = await fetch(resource, init);

  if (!response.ok) {
    const metadata = (await response.json()) as RequestErrorMetadata;
    throw new RequestError(metadata);
  }

  return response.json();
};
