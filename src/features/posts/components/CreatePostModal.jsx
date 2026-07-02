import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Modal from '../../../components/common/Modal'
import Button from '../../../components/common/Button'
import HashtagInput from './HashtagInput'
import { postsApi } from '../../../api/postsApi'
import { aiApi } from '../../../api/aiApi'

const MAX_FILES = 10
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']

export default function CreatePostModal({ isOpen, onClose }) {
  const [files, setFiles] = useState([])
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState([])
  const [suggestion, setSuggestion] = useState(null)
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

  // Best-effort only: a failed/unconfigured AI provider must never surface an
  // error to the user, it should just look like no suggestion was offered.
  const suggestMutation = useMutation({
    mutationFn: aiApi.suggestCaption,
    onSuccess: (res) => setSuggestion(res.data?.suggestion || null),
    onError: () => setSuggestion(null),
  })

  const isAllImages = files.length > 0 && files.every((file) => file.type.startsWith('image/'))

  const handleClose = () => {
    setFiles([])
    setCaption('')
    setHashtags([])
    setSuggestion(null)
    onClose()
  }

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || [])
    if (selected.length === 0) return

    if (selected.length > MAX_FILES) {
      toast.error(`You can upload up to ${MAX_FILES} files`)
      return
    }

    const invalid = selected.find((file) => !ACCEPTED_TYPES.includes(file.type))
    if (invalid) {
      toast.error(`Unsupported file type: ${invalid.name}`)
      return
    }

    setFiles(selected)
    setSuggestion(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (files.length === 0) {
      toast.error('Please select at least one photo or video')
      return
    }
    createMutation.mutate({ media: files, caption, hashtags })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
        <h2 className="text-lg font-semibold">Create new post</h2>

        <label htmlFor="create-post-file" className="sr-only">
          Select photos or videos
        </label>
        <input
          id="create-post-file"
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          onChange={handleFileChange}
        />

        {files.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {files.map((file, index) => (
              <img
                key={index}
                src={URL.createObjectURL(file)}
                alt={`preview-${index}`}
                className="h-20 w-full rounded object-cover"
              />
            ))}
          </div>
        )}

        {isAllImages && (
          <div>
            <Button
              type="button"
              variant="ghost"
              className="px-0"
              isLoading={suggestMutation.isPending}
              onClick={() => suggestMutation.mutate(files[0])}
            >
              ✨ Suggest caption
            </Button>
          </div>
        )}

        {suggestion && (
          <div className="flex items-start justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
            <span className="flex-1">Suggested: “{suggestion}”</span>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                className="text-brand hover:underline"
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
                ✕
              </button>
            </div>
          </div>
        )}

        <label htmlFor="create-post-caption" className="sr-only">
          Caption
        </label>
        <textarea
          id="create-post-caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption…"
          rows={3}
          className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-gray-700"
        />

        <HashtagInput hashtags={hashtags} onChange={setHashtags} />

        <div className="flex justify-end gap-2">
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
