declare module 'react' {
  export type ReactNode = any;

  export function useState<T>(initialValue: T | (() => T)): [T, (value: T | ((previous: T) => T)) => void];
  export function useRef<T>(initialValue: T | null): { current: T | null };
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;

  const React: {
    Fragment: any;
    createElement: any;
  };

  export default React;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elementName: string]: any;
  }
}
