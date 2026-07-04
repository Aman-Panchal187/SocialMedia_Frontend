import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function SkeletonPostCard() {
  return (
    <div className="mb-6 animate-fade-in rounded-xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-center gap-3">
        <Skeleton circle width={40} height={40} />
        <Skeleton width={120} height={14} />
      </div>
      <Skeleton height={360} />
      <div className="mt-3">
        <Skeleton width={100} height={14} />
        <Skeleton width="80%" height={14} />
      </div>
    </div>
  )
}
