import { Link } from 'react-router-dom'
import { PhoneIcon } from '../../../components/common/icons'

export default function CallsLink() {
  return (
    <Link
      to="/calls"
      aria-label="Calls"
      className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <PhoneIcon />
    </Link>
  )
}
