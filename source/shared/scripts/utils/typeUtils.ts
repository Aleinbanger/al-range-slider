type TMethod = (...args: never[]) => unknown;

type ExtractMethodsKeys<T> = {
  [P in keyof T]: T[P] extends TMethod ? P : never
}[keyof T];

type ExtractMethodArgs<T, P extends ExtractMethodsKeys<T>> = T[P] extends TMethod
  ? Parameters<T[P]>[number]
  : never;

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

type Entry<T> = keyof T extends string
  ? [keyof T, T[keyof T]]
  : [string, T[keyof T]];

export type {
  ExtractMethodsKeys,
  ExtractMethodArgs,
  Writeable,
  DeepWriteable,
  Entry,
};
