import React, {DependencyList, Dispatch, useCallback, useEffect, useRef} from "react";
import useMergedState from "rc-util/lib/hooks/useMergedState";

export const omitUndefined = <T extends {}>(obj: T): T => {
    const newObj = {} as T;
    Object.keys(obj || {}).forEach((key) => {
        if (obj[key] !== undefined) {
            newObj[key] = obj[key];
        }
    });
    if (Object.keys(newObj).length < 1) {
        return undefined as any;
    }
    return newObj;
};


export function isDeepEqualReact(a: any, b: any, ignoreKeys?: string[], debug?: boolean) {
    if (a === b) return true;

    if (a && b && typeof a === 'object' && typeof b === 'object') {
        if (a.constructor !== b.constructor) return false;

        let length;
        let i;
        let keys;
        if (Array.isArray(a)) {
            length = a.length;
            if (length != b.length) return false;
            for (i = length; i-- !== 0; )
                if (!isDeepEqualReact(a[i], b[i], ignoreKeys, debug)) return false;
            return true;
        }

        if (a instanceof Map && b instanceof Map) {
            if (a.size !== b.size) return false;
            for (i of a.entries()) if (!b.has(i[0])) return false;
            for (i of a.entries())
                if (!isDeepEqualReact(i[1], b.get(i[0]), ignoreKeys, debug)) return false;
            return true;
        }

        if (a instanceof Set && b instanceof Set) {
            if (a.size !== b.size) return false;
            for (i of a.entries()) if (!b.has(i[0])) return false;
            return true;
        }

        if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
            // @ts-ignore
            length = a.length;
            // @ts-ignore
            if (length != b.length) return false;
            for (i = length; i-- !== 0; ) if (a[i] !== b[i]) return false;
            return true;
        }

        if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf && a.valueOf) return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString && a.toString)
            return a.toString() === b.toString();

        // eslint-disable-next-line prefer-const
        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;

        for (i = length; i-- !== 0; )
            if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

        for (i = length; i-- !== 0; ) {
            const key = keys[i];

            if (ignoreKeys?.includes(key)) continue;

            if (key === '_owner' && a.$$typeof) {
                // React-specific: avoid traversing React elements' _owner.
                //  _owner contains circular references
                // and is not needed when comparing the actual elements (and not their owners)
                continue;
            }

            if (!isDeepEqualReact(a[key], b[key], ignoreKeys, debug)) {
                if (debug) {
                    console.log(key);
                }
                return false;
            }
        }

        return true;
    }

    // true if both NaN, false otherwise
    return a !== a && b !== b;
}


export const omitUndefinedAndEmptyArr = <T>(obj: T): T => {
    const newObj = {} as T;
    Object.keys(obj || {}).forEach((key) => {
        if (Array.isArray(obj[key]) && obj[key]?.length === 0) {
            return;
        }
        if (obj[key] === undefined) {
            return;
        }
        newObj[key] = obj[key];
    });
    return newObj;
};

export function useDebounceFn<T extends any[], U = any>(fn: (...args: T) => Promise<any>, wait?: number) {
    const callback = useRefFunction(fn);

    const timer = useRef<any>();

    const cancel = useCallback(() => {
        if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
        }
    }, []);

    const run = useCallback(
        async (...args: any): Promise<U | undefined> => {
            if (wait === 0 || wait === undefined) {
                return callback(...args);
            }
            cancel();
            return new Promise<U>((resolve) => {
                timer.current = setTimeout(async () => {
                    resolve(await callback(...args));
                }, wait);
            });
        },
        [callback, cancel, wait],
    );

    useEffect(() => {
        return cancel;
    }, [cancel]);

    return {
        run,
        cancel,
    };
}

export function useDeepCompareMemoize(value: any, ignoreKeys?: string[]) {
    const ref = useRef();
    // it can be done by using useMemo as well
    // but useRef is rather cleaner and easier
    if (!isDeepEqual(value, ref.current, ignoreKeys)) {
        ref.current = value;
    }

    return ref.current;
}

export const isDeepEqual = (a: any, b: any, ignoreKeys?: string[]) =>
    isDeepEqualReact(a, b, ignoreKeys);

export function useDeepCompareEffect(
    effect: React.EffectCallback,
    dependencies: DependencyList,
    ignoreKeys?: string[],
) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(effect, useDeepCompareMemoize(dependencies || [], ignoreKeys));
}

export function useDeepCompareEffectDebounce(
    effect: React.EffectCallback,
    dependencies: DependencyList,
    ignoreKeys?: string[],
    waitTime?: number,
) {
    const effectDn = useDebounceFn(async () => {
        effect();
    }, waitTime || 16);
    useEffect(() => {
        effectDn.run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, useDeepCompareMemoize(dependencies || [], ignoreKeys));
}
export function useMountMergeState<S>(
    initialState: S | (() => S),
    option?: {
        defaultValue?: S;
        value?: S;
        onChange?: (value: S, prevValue: S) => void;
        postState?: (value: S) => S;
    },
): [S, Dispatch<S>] {
    const [state, setState] = useMergedState<S>(initialState, option);
    return [state, setState];
}


export const usePrevious = <T>(state: T): T | undefined => {
    const ref = useRef<T>();

    useEffect(() => {
        ref.current = state;
    });

    return ref.current;
};

export const useRefFunction = <T extends (...args: any) => any>(reFunction: T) => {
    const ref = useRef<any>(null);
    ref.current = reFunction;
    return useCallback((...rest: Parameters<T>): ReturnType<T> => {
        return ref.current?.(...(rest as any));
    }, []);
};
