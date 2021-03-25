type ExtractFunctionKeys<T> = {
  [KEY in keyof T]-?: T[KEY] extends ((...args: never[]) => unknown) ? KEY : never
}[keyof T];

type ExtractFunctionArgs<T, KEY extends ExtractFunctionKeys<T>> = Parameters<T[KEY]>[number];

export type {
  ExtractFunctionKeys,
  ExtractFunctionArgs,
};
