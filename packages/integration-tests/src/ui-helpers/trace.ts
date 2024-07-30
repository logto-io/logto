import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { type Page } from 'puppeteer';

export class Trace {
  protected tracePath?: string;

  constructor(protected page?: Page) {}

  async start() {
    if (this.tracePath) {
      throw new Error('Trace already started');
    }

    if (!this.page) {
      throw new Error('Page not set');
    }

    const traceDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'trace-'));
    this.tracePath = path.join(traceDirectory, 'trace.json');
    await this.page.tracing.start({ path: this.tracePath, categories: ['devtools.timeline'] });
  }

  async stop() {
    if (!this.page) {
      throw new Error('Page not set');
    }

    console.log('Trace captured at', this.tracePath);
    return this.page.tracing.stop();
  }

  async read() {
    if (!this.tracePath) {
      throw new Error('Trace not started');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(await fs.readFile(this.tracePath, 'utf8'));
  }

  reset(page: Page) {
    this.page = page;
    this.tracePath = undefined;
  }

  async cleanup() {
    if (this.tracePath) {
      await fs.unlink(this.tracePath);
    }
  }
}
