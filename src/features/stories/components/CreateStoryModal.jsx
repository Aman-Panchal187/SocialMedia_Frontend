import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Modal from '../../../components/common/Modal'
import Button from '../../../components/common/Button'
import { storiesApi } from '../../../api/storiesApi'
import { STORY_FEED_QUERY_KEY } from '../hooks/useStoryFeed'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']

export default function CreateStoryModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: storiesApi.createStory,
    onSuccess: () => {
      toast.success('Story shared')
      queryClient.invalidateQueries({ queryKey: STORY_FEED_QUERY_KEY })
      handleClose()
    },
    onError: () => toast.error('Failed to share story'),
  })

  const handleClose = () => {
    setFile(null)
    setCaption('')
    onClose()
  }

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      toast.error(`Unsupported file type: ${selected.name}`)
      return
    }

    setFile(selected)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please select a photo or video')
      return
    }
    createMutation.mutate({ file, caption })
  }

  const isVideo = file?.type.startsWith('video/')

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
        <h2 className="text-lg font-semibold">Add to your story</h2>

        <label htmlFor="create-story-file" className="sr-only">
          Select a photo or video
        </label>
        <input
          id="create-story-file"
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileChange}
        />

        {file && (
          <div className="overflow-hidden rounded-lg bg-black">
            {isVideo ? (
              <video src={URL.createObjectURL(file)} controls className="max-h-80 w-full" />
            ) : (
              <img
                src={URL.createObjectURL(file)}
                alt="Story preview"
                className="max-h-80 w-full object-contain"
              />
            )}
          </div>
        )}

        <label htmlFor="create-story-caption" className="sr-only">
          Caption
        </label>
        <textarea
          id="create-story-caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption…"
          rows={2}
          className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-gray-700"
        />

        <div className="flex justify-end gap-2">
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
