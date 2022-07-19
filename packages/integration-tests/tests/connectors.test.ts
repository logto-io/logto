import { listConnectors } from '@/connector-api';

test('connector flow', async () => {
  // List connectors after initializing a new Logto instance
  const connectorDtos = await listConnectors();

  // There should be no connectors, or all connectors should be disabled.
  for (const connectorDto of connectorDtos) {
    expect(connectorDto.enabled).toBeFalsy();
  }

  // Next up: set up a social connector
});
