import { useQuery } from '@tanstack/react-query'
import Skeleton from 'react-loading-skeleton'
import Modal from '../../../components/common/Modal'
import Avatar from '../../../components/common/Avatar'
import LikeButton from './LikeButton'
import SaveButton from './SaveButton'
import CommentSection from './CommentSection'
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
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
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
        <div className="flex flex-col sm:flex-row">
          <div className="flex-1 bg-black">
            <img
              src={post.media?.[0]?.url}
              alt={post.caption || 'Post media'}
              className="max-h-[70vh] w-full object-contain"
            />
          </div>
          <div className="flex w-full flex-col sm:w-80">
            <div className="flex items-center gap-2 border-b border-gray-200 p-3 dark:border-gray-800">
              <Avatar src={post.author?.avatarUrl} alt={post.author?.username} size="sm" />
              <span className="text-sm font-semibold">{post.author?.username}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {post.caption && (
                <p className="mb-2 text-sm">
                  <span className="mr-1 font-semibold">{post.author?.username}</span>
                  {post.caption}
                </p>
              )}
              <CommentSection postId={post.id} />
            </div>
            <div className="flex items-center gap-3 border-t border-gray-200 p-3 dark:border-gray-800">
              <LikeButton postId={post.id} isLiked={post.isLiked} likeCount={post.likeCount} />
              <SaveButton postId={post.id} isSaved={post.isSaved} />
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
