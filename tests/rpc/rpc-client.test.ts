import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { RPCClient } from '../../src/rpc/client';
import { PingRequest, PingResponse } from '../../src/rpc/types';
import { deserialize, serialize } from '@dao-xyz/borsh';

describe('RPCClient', () => {
  vi.setConfig({ testTimeout: 60000 }); // 60 seconds

  let client: RPCClient;
  const TEST_ENDPOINT = 'wss://electron-11.kaspa.stream/kaspa/testnet-11/wrpc/borsh';

  beforeAll(() => {
    client = new RPCClient(TEST_ENDPOINT);
  });

  afterAll(async () => {
    await client.close();
  });

  describe('Borsh Serialization', () => {
    it('should serialize and deserialize PingRequest', () => {
      const request = new PingRequest();

      // Serialize the request
      const serialized = serialize(request);
      expect(serialized.length).toBe(0);

      // Deserialize the request
      const deserialized = deserialize(serialized, PingRequest);
      expect(deserialized).toBeInstanceOf(PingRequest);
    });
  });


  describe('ping', () => {
    it('should send ping request and receive successful response', async () => {
      const response = await client.ping();
      expect(response).toBeInstanceOf(PingResponse);
      expect(response.error).toBeUndefined();
    });

    it('should handle multiple concurrent pings', async () => {
      const promises = Array(3).fill(0).map(() => client.ping());
      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response).toBeInstanceOf(PingResponse);
        expect(response.error).toBeUndefined();
      });
    });

    it('should handle connection timeout', async () => {
      const badClient = new RPCClient('wss://invalid.endpoint');
      await expect(badClient.ping()).rejects.toThrow();
      await badClient.close();
    });
  });
});