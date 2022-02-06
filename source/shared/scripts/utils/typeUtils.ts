type ExtractFunctionKeys<T> = {
  [KEY in keyof T]-?: T[KEY] extends ((...args: never[]) => unknown) ? KEY : never
}[keyof T];

type ExtractFunctionArgs<T, KEY extends ExtractFunctionKeys<T>> = Parameters<T[KEY]>[number];

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

type Entry<T> = keyof T extends string ? [keyof T, T[keyof T]] : [string, T[keyof T]];

export type {
  ExtractFunctionKeys,
  ExtractFunctionArgs,
  Writeable,
  DeepWriteable,
  Entry,
};
