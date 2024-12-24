import { BaseResponse } from '.';
import { RPCError } from '../rpc-error';

export class PingResponse extends BaseResponse {
  constructor(error?: RPCError) {
    super(error);
  }
}
