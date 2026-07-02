import { Link } from 'react-router-dom'

export default function SearchLink() {
  return (
    <Link
      to="/search"
      aria-label="Search"
      className="rounded-full p-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-800"
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
