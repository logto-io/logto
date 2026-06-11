import { describe, expect, it } from 'vitest';

import { getSessionDisplayInfo, normalizeUserApplicationGrantGroups } from './session.js';

describe('getSessionDisplayInfo()', () => {
  it('should parse user agent, location, and ip from sign-in context', () => {
    expect(
      getSessionDisplayInfo({
        lastSubmission: {
          signInContext: {
            ip: '192.0.2.1',
            city: 'San Francisco',
            country: 'US',
            userAgent:
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          },
        },
      })
    ).toMatchObject({
      browserName: 'Chrome',
      city: 'San Francisco',
      country: 'US',
      ip: '192.0.2.1',
      location: 'San Francisco, US',
      name: 'Chrome on Apple Macintosh',
      osName: 'macOS',
    });
  });

  it('should use the device model in the display name when it is available', () => {
    expect(
      getSessionDisplayInfo({
        lastSubmission: {
          signInContext: {
            userAgent:
              'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
          },
        },
      }).name
    ).toBe('Mobile Safari on Apple iPhone');
  });

  it('should return empty info when sign-in context is missing or invalid', () => {
    expect(getSessionDisplayInfo({ lastSubmission: null })).toEqual({});
    expect(
      getSessionDisplayInfo({
        lastSubmission: {
          signInContext: {
            ip: 123,
          },
        },
      })
    ).toEqual({});
  });
});

describe('normalizeUserApplicationGrantGroups()', () => {
  it('should group grants by client id and keep the earliest issued-at time', () => {
    expect(
      normalizeUserApplicationGrantGroups([
        {
          id: 'grant-1',
          payload: {
            clientId: 'app-1',
            iat: 200,
          },
          application: {
            id: 'app-1',
            name: 'App One',
          },
        },
        {
          id: 'grant-2',
          payload: {
            clientId: 'app-1',
            iat: 100,
          },
          application: {
            id: 'app-1',
            name: 'App One',
          },
        },
      ])
    ).toEqual([
      {
        id: 'app-1',
        applicationId: 'app-1',
        applicationName: 'App One',
        iat: 100,
        grantIds: ['grant-1', 'grant-2'],
      },
    ]);
  });

  it('should sort grant groups by issued-at time in descending order', () => {
    expect(
      normalizeUserApplicationGrantGroups([
        {
          id: 'grant-1',
          payload: {
            clientId: 'app-1',
            iat: 100,
          },
          application: {
            id: 'app-1',
            name: 'App One',
          },
        },
        {
          id: 'grant-2',
          payload: {
            clientId: 'app-2',
            iat: 300,
          },
          application: {
            id: 'app-2',
            name: 'App Two',
          },
        },
      ])
    ).toEqual([
      {
        id: 'app-2',
        applicationId: 'app-2',
        applicationName: 'App Two',
        iat: 300,
        grantIds: ['grant-2'],
      },
      {
        id: 'app-1',
        applicationId: 'app-1',
        applicationName: 'App One',
        iat: 100,
        grantIds: ['grant-1'],
      },
    ]);
  });
});
