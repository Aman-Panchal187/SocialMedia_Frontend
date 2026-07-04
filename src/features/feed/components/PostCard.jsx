import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNowStrict } from 'date-fns'
import Avatar from '../../../components/common/Avatar'
import { ChatBubbleIcon } from '../../../components/common/icons'
import LikeButton from '../../posts/components/LikeButton'
import SaveButton from '../../posts/components/SaveButton'
import PostDetailModal from '../../posts/components/PostDetailModal'

export default function PostCard({ post }) {
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  return (
    <article className="mb-6 animate-fade-in overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs transition-shadow duration-200 hover:shadow-card dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-3 p-3">
        <Link to={`/${post.author?.username}`} className="shrink-0 transition-opacity hover:opacity-80">
          <Avatar src={post.author?.avatarUrl} alt={post.author?.username} size="sm" />
        </Link>
        <Link
          to={`/${post.author?.username}`}
          className="text-sm font-semibold transition-opacity hover:opacity-70"
        >
          {post.author?.username}
        </Link>
      </div>

      {post.media?.[0]?.mediaType === 'video' ? (
        <video
          src={post.media?.[0]?.mediaUrl}
          controls
          playsInline
          className="max-h-[600px] w-full bg-black object-contain"
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsDetailOpen(true)}
          className="block w-full bg-gray-100 dark:bg-gray-800"
        >
          <img
            src={post.media?.[0]?.mediaUrl}
            alt={post.caption || 'Post media'}
            onLoad={() => setIsImageLoaded(true)}
            className={`max-h-[600px] w-full object-cover transition-opacity duration-300 motion-reduce:transition-none ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </button>
      )}

      <div className="flex items-center gap-4 p-3">
        <LikeButton postId={post.id} isLiked={post.isLiked} likeCount={post.likeCount} />
        <button
          type="button"
          onClick={() => setIsDetailOpen(true)}
          aria-label="Comment"
          className="flex items-center gap-1.5 rounded-full text-gray-900 transition-transform duration-150 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 dark:text-gray-100 motion-reduce:transition-none motion-reduce:active:scale-100"
        >
          <ChatBubbleIcon />
          {post.commentCount > 0 && <span className="text-sm font-medium">{post.commentCount}</span>}
        </button>
        <SaveButton postId={post.id} isSaved={post.isSaved} className="ml-auto" />
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
        className="px-3 pb-3 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:hover:text-gray-300"
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
