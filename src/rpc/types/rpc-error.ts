import { field } from '@dao-xyz/borsh';

export class RPCError {
  @field({ type: 'string' })
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
