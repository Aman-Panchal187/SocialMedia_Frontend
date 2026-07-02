import Avatar from '../../../components/common/Avatar'

export default function UserListRow({ user, onClick, trailing }) {
  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <Avatar src={user.avatarUrl} alt={user.username} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="truncate text-sm font-semibold">{user.username}</p>
          {user.isPrivate && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-3.5 w-3.5 shrink-0 text-gray-400"
              aria-label="Private account"
            >
              <path
                fillRule="evenodd"
                d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3v-3A5.25 5.25 0 0 0 12 1.5Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <p className="truncate text-xs text-gray-500">{user.fullName}</p>
      </div>
      {trailing && (
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          {trailing}
        </div>
      )}
    </div>
  )
}
