import { Result } from './client';
export type * from './client';
export type * from './server';
export type MessageInfo<Ops, Id> = [Id | undefined, Ops | undefined, Result<Uint8Array>];
