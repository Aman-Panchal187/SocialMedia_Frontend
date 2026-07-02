const MESSAGES = {
  like: 'liked your post',
  comment: 'commented on your post',
  reply: 'replied to your comment',
  follow: 'started following you',
  follow_request: 'requested to follow you',
  story_reaction: 'reacted to your story',
  story_reply: 'replied to your story',
}

export function notificationMessage(type) {
  return MESSAGES[type] ?? 'sent you a notification'
}
