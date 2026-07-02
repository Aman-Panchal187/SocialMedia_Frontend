import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

export default function InfiniteScrollSentinel({ onIntersect, enabled = true }) {
  const { ref, inView } = useInView({ threshold: 0 })

  useEffect(() => {
    if (inView && enabled) {
      onIntersect()
    }
  }, [inView, enabled, onIntersect])

  return <div ref={ref} className="h-1 w-full" />
}
