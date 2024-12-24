import { RPCError } from '../rpc-error';
import { field } from '@dao-xyz/borsh';

abstract class BaseResponse {
  @field({ type: RPCError })
  error?: RPCError;

  protected constructor(error?: RPCError) {
    this.error = error;
  }
}

export { BaseResponse };
export * from './requests';
export * from './responses';
