export interface JsonClientMessage<Ops, Id> {
  id?: Id;
  method: Ops;
  params: any; // Use a more specific type if possible
}

export class JsonClientMessage<Ops, Id> {
  constructor(id: Id | undefined, method: Ops, params: any) {
    this.id = id;
    this.method = method;
    this.params = params;
  }
}

export interface JSONServerMessage<Ops, Id> {
  id?: Id;
  method?: Ops;
  params?: any; // Use a more specific type if possible
  error?: JsonServerError;
}

export class JSONServerMessage<Ops, Id> {
  constructor(
    id: Id | undefined,
    method: Ops | undefined,
    params: any | undefined,
    error: JsonServerError | undefined
  ) {
    this.id = id;
    this.method = method;
    this.params = params;
    this.error = error;
  }
}

export class JsonServerError {
  code: number;
  message: string;
  data?: any; // Use a more specific type if possible

  constructor(code: number, message: string, data?: any) {
    this.code = code;
    this.message = message;
    this.data = data;
  }

  toString(): string {
    return `code:${this.code} message:\`${this.message}\` data:${JSON.stringify(this.data)}`;
  }
}
