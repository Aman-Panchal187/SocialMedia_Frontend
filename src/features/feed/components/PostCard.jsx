import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNowStrict } from 'date-fns'
import Avatar from '../../../components/common/Avatar'
import LikeButton from '../../posts/components/LikeButton'
import SaveButton from '../../posts/components/SaveButton'
import PostDetailModal from '../../posts/components/PostDetailModal'

export default function PostCard({ post, feedQueryKey }) {
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  return (
    <article className="mb-6 rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-3 p-3">
        <Link to={`/${post.author?.username}`}>
          <Avatar src={post.author?.avatarUrl} alt={post.author?.username} size="sm" />
        </Link>
        <Link to={`/${post.author?.username}`} className="text-sm font-semibold">
          {post.author?.username}
        </Link>
      </div>

      <button type="button" onClick={() => setIsDetailOpen(true)} className="block w-full">
        <img
          src={post.media?.[0]?.mediaUrl}
          alt={post.caption || 'Post media'}
          className="max-h-[600px] w-full object-cover"
        />
      </button>

      <div className="flex items-center gap-3 p-3">
        <LikeButton
          postId={post.id}
          isLiked={post.isLiked}
          likeCount={post.likeCount}
          feedQueryKey={feedQueryKey}
        />
        <SaveButton postId={post.id} isSaved={post.isSaved} feedQueryKey={feedQueryKey} />
      </div>

      {post.caption && (
        <p className="px-3 pb-1 text-sm">
          <span className="mr-1 font-semibold">{post.author?.username}</span>
          {post.caption}
        </p>
      )}

      <button
        type="button"
        onClick={() => setIsDetailOpen(true)}
        className="px-3 pb-3 text-sm text-gray-500"
      >
        View all comments
      </button>

      <p className="px-3 pb-3 text-xs uppercase text-gray-400">
        {formatDistanceToNowStrict(new Date(post.createdAt))} ago
      </p>

      <PostDetailModal postId={post.id} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
    </article>
  )
}
