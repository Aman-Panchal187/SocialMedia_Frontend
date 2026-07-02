import { useInfiniteQuery } from '@tanstack/react-query'
import { callsApi } from '../../../api/callsApi'

export const CALL_HISTORY_QUERY_KEY = ['calls', 'history']

export function useCallHistory() {
  return useInfiniteQuery({
    queryKey: CALL_HISTORY_QUERY_KEY,
    queryFn: ({ pageParam }) => callsApi.getCallHistory({ cursor: pageParam, limit: 20 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
  })
}
