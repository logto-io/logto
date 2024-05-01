import { ConsoleLog } from '@logto/shared';
import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';

import { SilentConsoleLog, getConsoleLogFromContext, unknownConsole } from './console.js';

describe('console', () => {
  afterEach(() => {
    Sinon.restore();
  });

  describe('getConsoleLogFromContext', () => {
    it('should return the console log from the context', () => {
      const context = {
        console: new ConsoleLog('test'),
      };
      const result = getConsoleLogFromContext(context);

      expect(result).toBe(context.console);
    });

    it('should throw an error if the context does not have a console log in development', () => {
      Sinon.stub(EnvSet, 'values').get(() => ({ isProduction: false, isUnitTest: false }));
      const context = {};
      const act = () => getConsoleLogFromContext(context);

      expect(act).toThrowError(
        'Failed to get console log from context, please provide a valid context.'
      );
    });

    it('should return a silent console log in unit test', () => {
      const context = {};
      const result = getConsoleLogFromContext(context);

      expect(result).toBeInstanceOf(SilentConsoleLog);
    });

    it('should return the unknown console log in production', () => {
      Sinon.stub(EnvSet, 'values').get(() => ({ isProduction: true, isUnitTest: false }));
      const context = {};
      const result = getConsoleLogFromContext(context);
      expect(result).toBe(unknownConsole);
    });
  });
});
