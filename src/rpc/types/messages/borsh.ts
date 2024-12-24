import { serialize, deserialize, field, option } from '@dao-xyz/borsh';

export function toWsMsg<Ops, Id>(header: BorshReqHeader<Ops, Id>, payload: Uint8Array): Uint8Array {
  const headerBytes = serialize(header);
  const buffer = new Uint8Array(headerBytes.length + payload.length);
  buffer.set(headerBytes, 0);
  buffer.set(payload, headerBytes.length);
  return buffer;
}

export class BorshReqHeader<Ops, Id> {
  @field({ type: option('u64') })
  id?: Id;
  @field({ type: 'string' })
  op: Ops;

  constructor(id: Id | undefined, op: Ops) {
    this.id = id;
    this.op = op;
  }
}

export class BorshServerMessageHeader<Ops, Id> {
  @field({ type: option('u64') })
  id?: Id;
  @field({ type: 'u32' })
  kind: ServerMessageKind;
  @field({ type: option('u32') })
  op?: Ops;

  constructor(id: Id | undefined, kind: ServerMessageKind, op: Ops | undefined) {
    this.id = id;
    this.kind = kind;
    this.op = op;
  }
}

export enum ServerMessageKind {
  Success = 0,
  Error = 1,
  Notification = 0xff,
}

export class BorshClientMessage<Ops, Id> {
  header: BorshReqHeader<Ops, Id>;
  payload: Uint8Array;

  constructor(header: BorshReqHeader<Ops, Id>, payload: Uint8Array) {
    this.header = header;
    this.payload = payload;
  }

  static fromBytes<Ops, Id>(bytes: Uint8Array): BorshClientMessage<Ops, Id> {
    const header = deserialize(bytes, BorshReqHeader<Ops, Id>)  ;
    const payload = bytes.slice(serialize(header).length);
    return new BorshClientMessage(header, payload);
  }
}

export class BorshServerMessage<Ops, Id> {
  header: BorshServerMessageHeader<Ops, Id>;
  payload: Uint8Array;

  constructor(header: BorshServerMessageHeader<Ops, Id>, payload: Uint8Array) {
    this.header = header;
    this.payload = payload;
  }

  static fromBytes<Ops, Id>(bytes: Uint8Array): BorshServerMessage<Ops, Id> {
    const header = deserialize(bytes, BorshServerMessageHeader<Ops, Id>);
    const payload = bytes.slice(serialize(header).length);
    return new BorshServerMessage(header, payload);
  }

  toBytes(): Uint8Array {
    const headerBytes = serialize(this.header);
    const buffer = new Uint8Array(headerBytes.length + this.payload.length);
    buffer.set(headerBytes, 0);
    buffer.set(this.payload, headerBytes.length);
    return buffer;
  }
}
