import { ServerError } from '../errors/server-error';

interface ServerSuccess<T> {
  ok: true;
  value: T;
}

interface ServerFailure {
  ok: false;
  error: ServerError;
}

export type ServerResult<T> = ServerSuccess<T> | ServerFailure;
