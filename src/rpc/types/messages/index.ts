type WebSocketMessage = TextMessage | BinaryMessage;

interface TextMessage {
  kind: 'Text';
  content: string;
}

interface BinaryMessage {
  kind: 'Binary';
  content: Uint8Array;
}

export * from './borsh';
export * from './json';
export type * from './json';
export type { WebSocketMessage };
