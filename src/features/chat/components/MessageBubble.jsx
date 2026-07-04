import { format } from 'date-fns'
import clsx from 'clsx'
import { motion, useReducedMotion } from 'framer-motion'
import { PaperclipIcon, CheckIcon } from '../../../components/common/icons'

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
      return <video src={message.mediaUrl} controls className="max-h-64 w-full rounded-lg" />
    case 'file':
      return (
        <a
          href={message.mediaUrl}
          target="_blank"
          rel="noreferrer"
          download
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm underline dark:border-gray-700"
        >
          <PaperclipIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">{fileNameFromUrl(message.mediaUrl)}</span>
        </a>
      )
    default:
      return <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
  }
}

export default function MessageBubble({ message, isOwn }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className={clsx('flex w-full', isOwn ? 'justify-end' : 'justify-start')}>
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={clsx(
          'max-w-[75%] rounded-2xl px-3 py-2 shadow-xs',
          isOwn ? 'bg-brand text-white' : 'bg-white dark:bg-gray-800'
        )}
      >
        {message.replyToStoryId && (
          <p className={clsx('mb-1 text-[10px] uppercase', isOwn ? 'text-white/70' : 'text-gray-400')}>
            Replied to your story
          </p>
        )}
        <MessageContent message={message} />
        <div
          className={clsx(
            'mt-1 flex items-center justify-end gap-1 text-[10px]',
            isOwn ? 'text-white/70' : 'text-gray-400'
          )}
        >
          <span>{format(new Date(message.createdAt), 'h:mm a')}</span>
          {isOwn && (
            <span aria-label={message.status === 'read' ? 'Read' : 'Sent'}>
              <CheckIcon double={message.status === 'read'} className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      </motion.div>
    </div>
  )
}
