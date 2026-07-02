export function attachmentContentType(file) {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  return 'file'
}

export function messageStatusTick(status) {
  return status === 'read' ? '✓✓' : '✓'
}
