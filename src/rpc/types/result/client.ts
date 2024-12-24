import { ClientError } from '../errors/client-error';

interface Success<T> {
  ok: true;
  value: T;
}

interface Failure {
  ok: false;
  error: ClientError;
}

export type Result<T> = Success<T> | Failure;
