import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function PageLoader() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-3">
        <Skeleton circle width={48} height={48} containerClassName="flex justify-center" />
        <Skeleton height={14} />
        <Skeleton width="80%" height={14} />
      </div>
    </div>
  )
}
