import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Modal from '../../../components/common/Modal'
import ModalHeader from '../../../components/common/ModalHeader'
import Button from '../../../components/common/Button'
import { CloseIcon, ImageIcon } from '../../../components/common/icons'
import { storiesApi } from '../../../api/storiesApi'
import { useAuthStore } from '../../../app/store'
import { STORY_FEED_QUERY_KEY } from '../hooks/useStoryFeed'
import { ownStoriesQueryKey } from '../hooks/useOwnStories'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']

export default function CreateStoryModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((state) => state.user)

  const createMutation = useMutation({
    mutationFn: storiesApi.createStory,
    onSuccess: () => {
      toast.success('Story shared')
      queryClient.invalidateQueries({ queryKey: STORY_FEED_QUERY_KEY })
      if (currentUser?.username) {
        queryClient.invalidateQueries({ queryKey: ownStoriesQueryKey(currentUser.username) })
      }
      handleClose()
    },
    onError: () => toast.error('Failed to share story'),
  })

  const handleClose = () => {
    setFile(null)
    setCaption('')
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
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please select a photo or video')
      return
    }
    createMutation.mutate({ file, caption })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="overflow-hidden p-0 sm:max-w-xl">
      <form onSubmit={handleSubmit} className="flex max-h-[85vh] flex-col">
        <ModalHeader title="Add to your story" onClose={handleClose} />

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <label htmlFor="create-story-file" className="sr-only">
            Select a photo or video
          </label>
          <input
            ref={fileInputRef}
            id="create-story-file"
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
            <div className="group relative mx-auto aspect-[9/16] w-full max-w-xs animate-scale-in overflow-hidden rounded-lg bg-black">
              {file.type.startsWith('video/') ? (
                <video src={URL.createObjectURL(file)} className="h-full w-full object-contain" controls />
              ) : (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Story preview"
                  className="h-full w-full object-contain"
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

          <div>
            <label htmlFor="create-story-caption" className="sr-only">
              Caption
            </label>
            <textarea
              id="create-story-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption…"
              rows={2}
              className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 dark:border-gray-700"
            />
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-gray-200 px-5 py-4 dark:border-gray-800">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createMutation.isPending}>
            Share to story
          </Button>
        </div>
      </form>
    </Modal>
  )
}
