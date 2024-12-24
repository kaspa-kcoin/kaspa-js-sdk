import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Encoding, Resolver, RpcClient } from './kaspa-rpc/kaspa';
import { BorshClientMessage, BorshReqHeader, BorshServerMessage } from '../../src/rpc/types';
import { deserialize } from '@dao-xyz/borsh';

describe('RPCClient2', () => {
  vi.setConfig({ testTimeout: 60000 }); // 60 seconds

  let client: RpcClient;

  describe('ping2', () => {
    it('should send ping request and receive successful response2', async () => {
      const response = Buffer.from("872dbc9dc805acd3fb59976a", "hex");
      const a= deserialize(response, BorshReqHeader<number, number>)
    });


  });
});