import {useSuspenseQuery} from '@tanstack/react-query';
import {useMemo}          from 'react';

export type DataFor<T> = T extends {data: infer U}
  ? Exclude<U, undefined>
  : never;

export function useMappedQuerySync<T extends {data: any}, TOut>(query: T, map: (data: DataFor<T>) => TOut, deps: Array<unknown> = []) {
  const nextData = useMemo(() => {
    return query.data ? map(query.data) : undefined;
  }, [query.data, ...deps]);

  return {
    data: nextData,
  };
}

export function useMappedQueryPromise<T extends {data: any}, TOut>(query: T, map: (data: DataFor<T>) => Promise<TOut>, deps: Array<unknown> = []) {
  return useSuspenseQuery({
    queryKey: [`mapped`, query.data, ...deps],
    queryFn: async () => {
      return query.data ? await map(query.data!) : undefined;
    },
  });
}

type ConcatQuery<T extends Array<{data: any}>> = {
  [K in keyof T]: DataFor<T[K]>;
};

export function useConcatQuery<T extends Array<{data: any}>>(queries: [...T]): {data: ConcatQuery<T> | undefined} {
  const data = queries.every(query => query.data)
    ? queries.map(query => query.data) as any
    : undefined;

  return {data};
}
