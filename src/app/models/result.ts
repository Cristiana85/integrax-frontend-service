export class Result<T> {
  content?: T;

  mContent?: Map<string, string>;

  mMessage?: Map<string, string[]>;

  mMessageKey?: Map<string, Map<any, string[]>>;

  message?: string;

  successful?: boolean;

}
