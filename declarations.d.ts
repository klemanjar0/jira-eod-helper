declare type AnyFunction = (...args: any[]) => any;

declare type AnyObject = Record<string, any>;

declare type AnyArray = any[];

//@typescript-eslint/no-explicit-any
declare type Anything = any;

declare type Nullable<T> = T | null;

declare type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

declare type VoidCallback = () => void;
