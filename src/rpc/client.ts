import { BorshProtocol } from './protocol/borsh';
import { PingRequest, PingResponse } from './types';
import WebSocketHeartbeatJs from 'websocket-heartbeat-js';

class BridgePromise<T> {
  public resolve: (value: T) => void = () => {
  };
  public reject: (reason?: any) => void = () => {
  };
  public promise: Promise<T>;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

export class RPCClient {
  private protocol: BorshProtocol<string>;
  private readonly ws: WebSocketHeartbeatJs;
  private connectedPromise: BridgePromise<boolean>;

  constructor(endpoint: string) {
    this.ws = new WebSocketHeartbeatJs({ url: endpoint });
    this.protocol = new BorshProtocol<string>(this.ws, this.handleNotification.bind(this));
    this.connectedPromise = new BridgePromise<boolean>();

    this.ws.onopen = () => {
      this.connectedPromise.resolve(true);
      console.log('WebSocket connection established');
    };


    this.ws.onmessage = async (event) => {
      console.log('Received message:', event.data);
      if (event.data instanceof Blob) {
        await this.protocol.handleMessage({
          kind: 'Binary',
          content:new Uint8Array(await event.data.arrayBuffer())
        });
      } else if (typeof event.data === 'string') {
        await this.protocol.handleMessage({
          kind: 'Text',
          content: event.data
        });
      } else {
        console.error('Received non-binary message');
      }
    };

    this.ws.onclose = async () => {
      await this.protocol.handleDisconnect();
      console.log('WebSocket connection closed');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

  }

  async ping(): Promise<PingResponse> {
    return await this.sendRequest<PingRequest, PingResponse>("Ping", new PingRequest());
  }

  private async sendRequest<TReq, TRes>(method: string, req: TReq): Promise<TRes> {
    await this.connectedPromise.promise;
    return await this.protocol.request<TReq, TRes>(method, req);
  }

  private async handleNotification(op: string, data: Uint8Array): Promise<void> {
    console.log(`Received notification: ${op}`, data);
  }

  async close(): Promise<void> {
    this.ws.close();
    await this.protocol.handleDisconnect();
  }
}