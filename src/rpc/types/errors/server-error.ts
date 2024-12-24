export enum ServerErrorKind {
  Close = 'Close',
  Timeout = 'Timeout',
  NoData = 'NoData',
  NotFound = 'NotFound',
  PoisonError = 'PoisonError',
  NonBorshRequest = 'NonBorshRequest',
  NonSerdeRequest = 'NonSerdeRequest',
  ReqSerialize = 'ReqSerialize',
  ReqDeserialize = 'ReqDeserialize',
  RespSerialize = 'RespSerialize',
  NotificationDeserialize = 'NotificationDeserialize',
  RespDeserialize = 'RespDeserialize',
  Data = 'Data',
  Text = 'Text',
  WebSocketError = 'WebSocketError',
  ReceiveChannelRx = 'ReceiveChannelRx',
  ReceiveChannelTx = 'ReceiveChannelTx'
}

export class ServerError extends Error {
  kind: ServerErrorKind;
  data?: Uint8Array;

  constructor(kind: ServerErrorKind, message?: string, data?: Uint8Array) {
    super(message || kind);
    this.kind = kind;
    this.data = data;
    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
  }
}
