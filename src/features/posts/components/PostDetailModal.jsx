import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Skeleton from 'react-loading-skeleton'
import { formatDistanceToNowStrict } from 'date-fns'
import Modal from '../../../components/common/Modal'
import Avatar from '../../../components/common/Avatar'
import { CloseIcon } from '../../../components/common/icons'
import LikeButton from './LikeButton'
import SaveButton from './SaveButton'
import CommentSection from './CommentSection'
import CommentComposer from './CommentComposer'
import { postsApi } from '../../../api/postsApi'

export default function PostDetailModal({ postId, isOpen, onClose }) {
  const postQuery = useQuery({
    queryKey: ['post', postId],
    queryFn: () => postsApi.getPost(postId),
    enabled: isOpen && Boolean(postId),
    select: (data) => data.data,
  })

  const post = postQuery.data

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Post"
      className="overflow-hidden p-0 sm:max-w-5xl"
    >
      {postQuery.isLoading && (
        <div className="flex flex-col gap-3 p-6 sm:flex-row">
          <Skeleton height={320} containerClassName="flex-1" />
          <div className="w-full space-y-3 sm:w-80">
            <div className="flex items-center gap-3">
              <Skeleton circle width={32} height={32} />
              <Skeleton width="50%" height={12} />
            </div>
            <Skeleton count={3} />
          </div>
        </div>
      )}

      {post && (
        <div className="flex h-[85vh] max-h-[640px] flex-col bg-white dark:bg-gray-900 sm:flex-row">
          <div className="flex shrink-0 basis-1/2 items-center justify-center bg-black sm:min-h-[220px] sm:basis-auto sm:flex-1 sm:shrink">
            {post.media?.[0]?.mediaType === 'video' ? (
              <video
                src={post.media?.[0]?.mediaUrl}
                controls
                playsInline
                className="h-full w-full object-contain"
              />
            ) : (
              <img
                src={post.media?.[0]?.mediaUrl}
                alt={post.caption || 'Post media'}
                className="h-full w-full object-contain"
              />
            )}
          </div>

          <div className="flex w-full min-h-0 flex-1 flex-col sm:w-[360px] sm:flex-none sm:shrink-0 sm:border-l sm:border-gray-200 sm:dark:border-gray-800">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 p-3 dark:border-gray-800">
              <Link
                to={`/${post.author?.username}`}
                className="flex items-center gap-2 transition-opacity hover:opacity-80"
              >
                <Avatar src={post.author?.avatarUrl} alt={post.author?.username} size="sm" />
                <span className="text-sm font-semibold">{post.author?.username}</span>
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-full p-1 text-gray-400 transition-[background-color,transform] duration-150 hover:bg-gray-100 hover:text-gray-600 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 dark:hover:bg-gray-800 motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {post.caption && (
                <div className="mb-3 flex gap-3">
                  <Avatar src={post.author?.avatarUrl} alt={post.author?.username} size="xs" className="shrink-0" />
                  <p className="text-sm">
                    <span className="mr-1 font-semibold">{post.author?.username}</span>
                    {post.caption}
                  </p>
                </div>
              )}
              <CommentSection postId={post.id} />
            </div>

            <div className="shrink-0 border-t border-gray-200 p-3 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <LikeButton
                  postId={post.id}
                  isLiked={post.isLiked}
                  likeCount={post.likeCount}
                  postQueryKey={['post', post.id]}
                />
                <SaveButton
                  postId={post.id}
                  isSaved={post.isSaved}
                  postQueryKey={['post', post.id]}
                  className="ml-auto"
                />
              </div>
              <p className="mt-2 text-xs uppercase text-gray-400">
                {formatDistanceToNowStrict(new Date(post.createdAt))} ago
              </p>
            </div>

            <CommentComposer postId={post.id} />
          </div>
        </div>
      )}
    </Modal>
  )
}
