export enum ClientErrorKind {
  InvalidEvent = 'InvalidEvent',
  InvalidUrl = 'InvalidUrl',
  RpcError = 'RpcError',
  ResponseHandler = 'ResponseHandler',
  Disconnect = 'Disconnect',
  NotificationMethod = 'NotificationMethod',
  WebSocketMessageType = 'WebSocketMessageType',
  MissingNotificationHandler = 'MissingNotificationHandler',
  WebSocketError = 'WebSocketError',
  Timeout = 'Timeout',
  ReceiverCtl = 'ReceiverCtl',
  NoDataInSuccessResponse = 'NoDataInSuccessResponse',
  NoDataInNotificationMessage = 'NoDataInNotificationMessage',
  NoDataInErrorResponse = 'NoDataInErrorResponse',
  ErrorDeserializingServerMessageData = 'ErrorDeserializingServerMessageData',
  ErrorDeserializingResponseData = 'ErrorDeserializingResponseData',
  StatusCode = 'StatusCode',
  RpcCall = 'RpcCall',
  BorshSerialize = 'BorshSerialize',
  BorshDeserialize = 'BorshDeserialize',
  SerdeSerialize = 'SerdeSerialize',
  SerdeDeserialize = 'SerdeDeserialize',
  BorshResponseDeserialize = 'BorshResponseDeserialize',
  ChannelRecvError = 'ChannelRecvError',
  ChannelSendError = 'ChannelSendError',
  Utf8Error = 'Utf8Error',
  SerdeJSON = 'SerdeJSON',
  Task = 'Task',
  ServerError = 'ServerError',
  JsonServerError = 'JsonServerError',
}

export class ClientError extends Error {
  kind: ClientErrorKind;

  constructor(kind: ClientErrorKind, message?: string) {
    super(message || kind);
    this.kind = kind;
    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
  }
}