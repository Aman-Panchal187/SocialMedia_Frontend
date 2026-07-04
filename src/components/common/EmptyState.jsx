export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex animate-fade-in flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
          <Icon className="h-7 w-7" />
        </div>
      )}
      {title && <p className="text-base font-semibold">{title}</p>}
      {description && <p className="max-w-xs text-sm text-gray-500">{description}</p>}
      {action}
    </div>
  )
}
