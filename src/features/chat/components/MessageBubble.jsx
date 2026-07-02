import { formatDistanceToNowStrict } from 'date-fns'
import clsx from 'clsx'
import { messageStatusTick } from '../messageHelpers'

function fileNameFromUrl(url) {
  if (!url) return 'file'
  try {
    return decodeURIComponent(url.split('/').pop().split('?')[0])
  } catch {
    return 'file'
  }
}

function MessageContent({ message }) {
  switch (message.contentType) {
    case 'image':
      return (
        <img
          src={message.mediaUrl}
          alt="Shared attachment"
          className="max-h-64 w-full rounded-lg object-cover"
        />
      )
    case 'video':
      return (
        <video src={message.mediaUrl} controls className="max-h-64 w-full rounded-lg" />
      )
    case 'file':
      return (
        <a
          href={message.mediaUrl}
          target="_blank"
          rel="noreferrer"
          download
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm underline dark:border-gray-700"
        >
          📎 {fileNameFromUrl(message.mediaUrl)}
        </a>
      )
    default:
      return <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
  }
}

export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={clsx('flex w-full', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[75%] rounded-2xl px-3 py-2',
          isOwn ? 'bg-brand text-white' : 'bg-gray-100 dark:bg-gray-800'
        )}
      >
        {message.replyToStoryId && (
          <p className={clsx('mb-1 text-[10px] uppercase', isOwn ? 'text-white/70' : 'text-gray-400')}>
            Replied to your story
          </p>
        )}
        <MessageContent message={message} />
        <div className={clsx('mt-1 flex items-center justify-end gap-1 text-[10px]', isOwn ? 'text-white/70' : 'text-gray-400')}>
          <span>{formatDistanceToNowStrict(new Date(message.createdAt))} ago</span>
          {isOwn && (
            <span aria-label={message.status === 'read' ? 'Read' : 'Sent'}>
              {messageStatusTick(message.status)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
