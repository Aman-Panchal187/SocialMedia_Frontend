import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useSendMessage } from '../hooks/useMessages'
import { attachmentContentType } from '../messageHelpers'
import { PaperclipIcon, SendIcon, CloseIcon } from '../../../components/common/icons'

const TYPING_STOP_DELAY_MS = 2000
const MAX_ATTACHMENT_BYTES = 50 * 1024 * 1024
const ACCEPTED_ATTACHMENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'video/mp4',
  'application/pdf',
  'application/zip',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export default function MessageComposer({ conversationId, onTyping }) {
  const [text, setText] = useState('')
  const [attachment, setAttachment] = useState(null)
  const fileInputRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const sendMessageMutation = useSendMessage(conversationId)

  const stopTyping = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    onTyping?.(false)
  }

  const handleTextChange = (e) => {
    setText(e.target.value)
    onTyping?.(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => onTyping?.(false), TYPING_STOP_DELAY_MS)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_ATTACHMENT_TYPES.includes(file.type)) {
      toast.error('Unsupported file type')
      e.target.value = ''
      return
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast.error('File is too large (max 50MB)')
      e.target.value = ''
      return
    }

    setAttachment(file)
  }

  const clearAttachment = () => {
    setAttachment(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    stopTyping()

    if (attachment) {
      sendMessageMutation.mutate({ contentType: attachmentContentType(attachment), file: attachment })
      clearAttachment()
      return
    }

    const trimmed = text.trim()
    if (!trimmed) return
    sendMessageMutation.mutate({ contentType: 'text', content: trimmed })
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-gray-200 p-3 dark:border-gray-800">
      {attachment && (
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm dark:bg-gray-800">
          {attachment.type.startsWith('image/') ? (
            <img src={URL.createObjectURL(attachment)} alt="preview" className="h-10 w-10 rounded object-cover" />
          ) : (
            <PaperclipIcon className="h-5 w-5 shrink-0 text-gray-500" />
          )}
          <span className="flex-1 truncate">{attachment.name}</span>
          <button
            type="button"
            onClick={clearAttachment}
            aria-label="Remove attachment"
            className="rounded-full p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_ATTACHMENT_TYPES.join(',')}
          onChange={handleFileChange}
          className="hidden"
          id="chat-attachment-input"
        />
        <label
          htmlFor="chat-attachment-input"
          aria-label="Attach a file"
          className="flex shrink-0 cursor-pointer items-center justify-center rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <PaperclipIcon />
        </label>
        <label htmlFor="message-composer-input" className="sr-only">
          Message
        </label>
        <input
          id="message-composer-input"
          type="text"
          value={text}
          onChange={handleTextChange}
          onBlur={stopTyping}
          placeholder="Message…"
          disabled={Boolean(attachment)}
          className="flex-1 rounded-full border border-gray-300 bg-transparent px-4 py-2 text-sm outline-none focus:border-brand disabled:opacity-50 dark:border-gray-700"
        />
        <button
          type="submit"
          disabled={sendMessageMutation.isPending || (!attachment && !text.trim())}
          aria-label="Send message"
          className="flex shrink-0 items-center justify-center rounded-full bg-brand p-2.5 text-white transition-opacity hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SendIcon />
        </button>
      </div>
    </form>
  )
}
