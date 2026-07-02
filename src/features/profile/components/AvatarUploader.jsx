import { lazy, Suspense, useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Modal from '../../../components/common/Modal'
import Button from '../../../components/common/Button'
import Avatar from '../../../components/common/Avatar'
import { usersApi } from '../../../api/usersApi'
import { useAuthStore } from '../../../app/store'

const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif']

const Cropper = lazy(() => import('react-easy-crop'))

async function getCroppedBlob(imageSrc, cropPixels) {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = cropPixels.width
  canvas.height = cropPixels.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height
  )
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', reject)
    image.src = src
  })
}

export default function AvatarUploader() {
  const user = useAuthStore((state) => state.user)
  const setAuth = useAuthStore((state) => state.setAuth)
  const queryClient = useQueryClient()

  const [imageSrc, setImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const uploadMutation = useMutation({
    mutationFn: usersApi.updateAvatar,
    onSuccess: (res) => {
      toast.success('Avatar updated')
      setAuth({ user: { ...user, avatarUrl: res.data.user.avatarUrl } })
      queryClient.invalidateQueries()
      setImageSrc(null)
    },
  })

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Avatar must be a JPG, PNG, or GIF')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('Avatar must be under 5MB')
      return
    }

    const reader = new FileReader()
    reader.addEventListener('load', () => setImageSrc(reader.result))
    reader.readAsDataURL(file)
  }

  const onCropComplete = useCallback((_croppedArea, pixels) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    const blob = await getCroppedBlob(imageSrc, croppedAreaPixels)
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
    uploadMutation.mutate(file)
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar src={user?.avatarUrl} alt={user?.username} size="lg" />
      <label className="cursor-pointer text-sm font-semibold text-brand hover:underline">
        Change photo
        <input type="file" accept={ACCEPTED_TYPES.join(',')} onChange={handleFileChange} className="hidden" />
      </label>

      <Modal isOpen={Boolean(imageSrc)} onClose={() => setImageSrc(null)}>
        <div className="flex flex-col gap-4 p-5">
          <div className="relative h-72 w-full bg-black">
            {imageSrc && (
              <Suspense
                fallback={
                  <div className="flex h-full w-full items-center justify-center text-sm text-gray-300">
                    Loading editor…
                  </div>
                }
              >
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </Suspense>
            )}
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setImageSrc(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} isLoading={uploadMutation.isPending}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
