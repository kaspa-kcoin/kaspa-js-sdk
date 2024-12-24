import { deserialize, serialize } from '@dao-xyz/borsh';
import {
  BorshReqHeader,
  BorshServerMessage,
  ClientError,
  ClientErrorKind,
  Result,
  ServerError,
  ServerErrorKind,
  ServerMessageKind,
  ServerResult,
  toWsMsg,
  WebSocketMessage
} from '../types';
import { randomBytes } from '@noble/hashes/utils';
import WebSocketHeartbeatJs from 'websocket-heartbeat-js';

type BorshResponseFn<T> = (result: Result<T>, duration?: number) => void;

interface Pending<T> {
  timestamp: number;
  callback: BorshResponseFn<T>;
}

type NotificationCallback<Ops> = (ops: Ops, data: Uint8Array) => Promise<void>;
type Id = number;

export class BorshProtocol<Ops> {
  private ws: WebSocketHeartbeatJs;
  private pending: Map<Id, Pending<any>>;
  private notificationCallback: NotificationCallback<Ops>;

  constructor(ws: WebSocketHeartbeatJs, notificationCallback: NotificationCallback<Ops>) {
    this.ws = ws;
    this.pending = new Map();
    this.notificationCallback = notificationCallback;
  }

  private decode(serverMessage: Uint8Array): ServerResult<[Id | undefined, Ops | undefined, Result<Uint8Array>]> {
    let message: BorshServerMessage<Ops, Id>;
    try {
      message = BorshServerMessage.fromBytes<Ops, Id>(serverMessage);
    } catch (err) {
      return { ok: false, error: new ServerError(ServerErrorKind.RespDeserialize, String(err)) };
    }

    const { header } = message;
    switch (header.kind) {
      case ServerMessageKind.Success:
        return { ok: true, value: [header.id, header.op, { ok: true, value: message.payload }] };
      case ServerMessageKind.Error:
        const error = deserialize(message.payload, ServerError);
        return { ok: false, error };
      case ServerMessageKind.Notification:
        return { ok: true, value: [undefined, header.op, { ok: true, value: message.payload }] };
      default:
        throw new ClientError(ClientErrorKind.WebSocketMessageType, 'Unknown message kind');
    }
  }

  async request<Req, Resp>(op: Ops, req: Req): Promise<Resp> {
    const payload = serialize(req);
    const id = this.generateU32Id();

    return new Promise((resolve, reject) => {
      const callback: BorshResponseFn<Resp> = (result, _duration) => {
        if (result.ok) {
          resolve(result.value);
        } else {
          reject(result.error);
        }
      };

      this.pending.set(id, { timestamp: Date.now(), callback });

      const message = toWsMsg(new BorshReqHeader(id, op), payload);
      this.ws.send(message);
    });
  }

  async notify<Msg>(op: Ops, payload: Msg): Promise<void> {
    const message = toWsMsg(new BorshReqHeader<Ops, Id>(undefined, op), serialize(payload));
    this.ws.send(message);
  }

  private async handleNotification(op: Ops, payload: Uint8Array): Promise<void> {
    if (this.notificationCallback) {
      try {
        await this.notificationCallback(op, payload);
      } catch (err) {
        console.error('Error handling server notification:', err);
      }
    } else {
      console.error('Unable to handle server notification - interface is not initialized');
    }
  }

  async handleTimeout(timeout: number): Promise<void> {
    const now = Date.now();
    for (const [id, pending] of this.pending.entries()) {
      if (now - pending.timestamp > timeout) {
        pending.callback({ ok: false, error: new ClientError(ClientErrorKind.Timeout) });
        this.pending.delete(id);
      }
    }
  }

  async handleDisconnect(): Promise<void> {
    for (const pending of this.pending.values()) {
      pending.callback({ ok: false, error: new ClientError(ClientErrorKind.Disconnect) });
    }
    this.pending.clear();
  }

  async handleMessage(message: WebSocketMessage): Promise<void> {
    if (message.kind !== 'Binary') {
      throw new ClientError(ClientErrorKind.WebSocketMessageType);
    }

    const result = this.decode(message.content);
    if (result.ok) {
      const [id, op, res] = result.value;
      if (id) {
        const pending = this.pending.get(id);
        if (pending) {
          this.pending.delete(id);
          pending.callback(res, Date.now() - pending.timestamp);
        } else {
          throw new ClientError(ClientErrorKind.ResponseHandler, `No pending request for id: ${id}`);
        }
      } else if (op && res.ok) {
        await this.handleNotification(op, res.value);
      } else {
        throw new ClientError(ClientErrorKind.NotificationMethod);
      }
    } else {
      throw result.error;
    }
  }

  private generateU64Id(): bigint {

    return new DataView(randomBytes(8).buffer).getBigUint64(0, true);
  }

  private generateU32Id(): number {
    return new DataView(randomBytes(4).buffer).getUint32(0, true);
  }
}
