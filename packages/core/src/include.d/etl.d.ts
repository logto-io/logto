declare module 'etl' {
  import { type Transform } from 'node:stream';

  export type MapStream = Transform & {
    promise(): Promise<void>;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function map(function_: (...args: any[]) => void | Promise<void>): MapStream;
}
