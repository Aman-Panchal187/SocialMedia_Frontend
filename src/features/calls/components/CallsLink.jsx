import { Link } from 'react-router-dom'

export default function CallsLink() {
  return (
    <Link
      to="/calls"
      aria-label="Calls"
      className="rounded-full p-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      📞
    </Link>
  )
}
