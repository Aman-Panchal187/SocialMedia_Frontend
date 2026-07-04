import { Link } from 'react-router-dom'

export default function SearchLink() {
  return (
    <Link
      to="/search"
      aria-label="Search"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100/70 text-gray-700 transition-[background-color,transform] duration-150 hover:bg-gray-200 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:bg-gray-700 motion-reduce:transition-none motion-reduce:active:scale-100"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </Link>
  )
}
