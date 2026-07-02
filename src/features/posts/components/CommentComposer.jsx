import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { postsApi } from '../../../api/postsApi'
import Button from '../../../components/common/Button'

export default function CommentComposer({ postId }) {
  const [content, setContent] = useState('')
  const queryClient = useQueryClient()

  const addCommentMutation = useMutation({
    mutationFn: (payload) => postsApi.addComment(postId, payload),
    onSuccess: () => {
      setContent('')
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
    onError: () => toast.error('Failed to post comment'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim()) return
    addCommentMutation.mutate({ content: content.trim() })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex shrink-0 items-center gap-2 border-t border-gray-200 p-3 dark:border-gray-800"
    >
      <label htmlFor={`comment-input-${postId}`} className="sr-only">
        Add a comment
      </label>
      <input
        id={`comment-input-${postId}`}
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment…"
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
      />
      <Button
        type="submit"
        variant="ghost"
        className="shrink-0 px-2 py-1 disabled:opacity-40"
        disabled={!content.trim() || addCommentMutation.isPending}
      >
        Post
      </Button>
    </form>
  )
}
