import dotenv from 'dotenv';
import { setDefaultOptions } from 'expect-puppeteer';
import fetch from 'node-fetch';
import { TextDecoder, TextEncoder } from 'text-encoder';

const { jest } = import.meta;

dotenv.config();

/* eslint-disable @silverhand/fp/no-mutation */
global.fetch = fetch;
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
/* eslint-enable @silverhand/fp/no-mutation */

// GitHub Actions default runners need more time for UI tests
jest.setTimeout(60_000);
setDefaultOptions({ timeout: 5000 });
