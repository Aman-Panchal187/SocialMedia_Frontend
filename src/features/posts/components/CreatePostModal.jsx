import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Modal from '../../../components/common/Modal'
import ModalHeader from '../../../components/common/ModalHeader'
import Button from '../../../components/common/Button'
import { CloseIcon, ImageIcon } from '../../../components/common/icons'
import { postsApi } from '../../../api/postsApi'
import { aiApi } from '../../../api/aiApi'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']

export default function CreatePostModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')
  const [suggestion, setSuggestion] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: postsApi.createPost,
    onSuccess: () => {
      toast.success('Post created')
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      handleClose()
    },
    onError: () => toast.error('Failed to create post'),
  })

  // An unconfigured AI provider resolves successfully with a null suggestion
  // (handled below, no error) — but an actual provider failure rejects, and
  // the axios interceptor's global error toast surfaces it to the user; this
  // handler just resets local state so a stale suggestion doesn't linger.
  const suggestMutation = useMutation({
    mutationFn: aiApi.suggestCaption,
    onSuccess: (res) => setSuggestion(res.data?.suggestion || null),
    onError: () => setSuggestion(null),
  })

  const isImage = file?.type.startsWith('image/')

  const handleClose = () => {
    setFile(null)
    setCaption('')
    setSuggestion(null)
    setIsDragging(false)
    onClose()
  }

  const setSingleFile = (incoming) => {
    if (!incoming) return

    if (!ACCEPTED_TYPES.includes(incoming.type)) {
      toast.error(`Unsupported file type: ${incoming.name}`)
      return
    }

    setFile(incoming)
    setSuggestion(null)
  }

  const handleFileChange = (e) => {
    setSingleFile(e.target.files?.[0])
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    setSingleFile(e.dataTransfer.files?.[0])
  }

  const removeFile = () => {
    setFile(null)
    setSuggestion(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please select a photo or video')
      return
    }
    createMutation.mutate({ media: [file], caption })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="overflow-hidden p-0 sm:max-w-xl">
      <form onSubmit={handleSubmit} className="flex max-h-[85vh] flex-col">
        <ModalHeader title="Create new post" onClose={handleClose} />

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <label htmlFor="create-post-file" className="sr-only">
            Select a photo or video
          </label>
          <input
            ref={fileInputRef}
            id="create-post-file"
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />

          {!file ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ${
                isDragging
                  ? 'border-brand bg-brand/5'
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'
              }`}
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-150 ${isDragging ? 'bg-brand/10 text-brand' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}
              >
                <ImageIcon className="h-7 w-7" />
              </span>
              <span className="text-sm font-medium">
                Drag a photo or video here, or <span className="text-brand">browse</span>
              </span>
              <span className="text-xs text-gray-400">JPG, PNG, GIF, or MP4 — one file at a time</span>
            </button>
          ) : (
            <div className="group relative mx-auto h-56 w-full max-w-xs shrink-0 animate-scale-in overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              {file.type.startsWith('video/') ? (
                <video src={URL.createObjectURL(file)} className="h-full w-full object-cover" controls />
              ) : (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Selected media preview"
                  className="h-full w-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={removeFile}
                aria-label="Remove file"
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition-transform duration-150 hover:bg-black/80 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          {isImage && (
            <Button
              type="button"
              variant="ghost"
              className="px-0"
              isLoading={suggestMutation.isPending}
              onClick={() => suggestMutation.mutate(file)}
            >
              ✨ Suggest caption
            </Button>
          )}

          {suggestion && (
            <div className="flex animate-scale-in items-start justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
              <span className="flex-1">Suggested: “{suggestion}”</span>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  className="font-medium text-brand hover:underline"
                  onClick={() => {
                    setCaption(suggestion)
                    setSuggestion(null)
                  }}
                >
                  Use this
                </button>
                <button
                  type="button"
                  aria-label="Dismiss suggestion"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setSuggestion(null)}
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="create-post-caption" className="sr-only">
              Caption
            </label>
            <textarea
              id="create-post-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption…"
              rows={3}
              className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand dark:border-gray-700"
            />
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-gray-200 px-5 py-4 dark:border-gray-800">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createMutation.isPending}>
            Share
          </Button>
        </div>
      </form>
    </Modal>
  )
}
