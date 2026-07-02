import Skeleton from 'react-loading-skeleton'
import InfiniteScrollSentinel from '../../../components/common/InfiniteScrollSentinel'
import { useCallHistory } from '../hooks/useCallHistory'
import CallHistoryItem from '../components/CallHistoryItem'

export default function CallHistoryPage() {
  const callHistoryQuery = useCallHistory()

  const calls = callHistoryQuery.data?.pages.flatMap((page) => page.data.items) ?? []

  return (
    <div className="mx-auto max-w-lg px-2">
      <h1 className="px-2 py-3 text-lg font-semibold">Calls</h1>

      {callHistoryQuery.isLoading && (
        <div className="space-y-3 p-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton circle width={40} height={40} />
              <div className="flex-1">
                <Skeleton width="60%" height={12} />
                <Skeleton width="40%" height={10} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!callHistoryQuery.isLoading && calls.length === 0 && (
        <p className="py-16 text-center text-sm text-gray-500">No calls yet.</p>
      )}

      <div className="flex flex-col gap-1">
        {calls.map((call) => (
          <CallHistoryItem key={call.id} call={call} />
        ))}
      </div>

      <InfiniteScrollSentinel
        enabled={callHistoryQuery.hasNextPage && !callHistoryQuery.isFetchingNextPage}
        onIntersect={() => callHistoryQuery.fetchNextPage()}
      />
    </div>
  )
}
