import Avatar from '../../../components/common/Avatar'
import { notificationMessage } from '../notificationMessage'

export default function NotificationToast({ notification, visible }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg bg-white p-3 shadow-popover transition-opacity duration-200 dark:bg-gray-900 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Avatar src={notification.actor?.avatarUrl} alt={notification.actor?.username} size="sm" />
      <p className="text-sm">
        <span className="mr-1 font-semibold">{notification.actor?.username}</span>
        {notificationMessage(notification.type)}
      </p>
    </div>
  )
}
