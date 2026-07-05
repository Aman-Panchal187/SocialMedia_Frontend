import { Link } from 'react-router-dom'
import { SearchIcon } from '../../../components/common/icons'

export default function SearchLink() {
  return (
    <Link
      to="/search"
      aria-label="Search"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100/70 text-gray-700 transition-[background-color,transform] duration-150 hover:bg-gray-200 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:bg-gray-700 motion-reduce:transition-none motion-reduce:active:scale-100"
    >
      <SearchIcon />
    </Link>
  )
}
