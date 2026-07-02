import { useState } from 'react'

export default function HashtagInput({ hashtags, onChange }) {
  const [draft, setDraft] = useState('')

  const addHashtag = () => {
    const tag = draft.trim().replace(/^#/, '')
    if (!tag || hashtags.includes(tag)) {
      setDraft('')
      return
    }
    onChange([...hashtags, tag])
    setDraft('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addHashtag()
    }
  }

  const removeHashtag = (tag) => {
    onChange(hashtags.filter((t) => t !== tag))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {hashtags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-brand/10 px-2 py-1 text-xs font-medium text-brand"
          >
            #{tag}
            <button type="button" onClick={() => removeHashtag(tag)} aria-label={`Remove ${tag}`}>
              ×
            </button>
          </span>
        ))}
      </div>
      <label htmlFor="hashtag-input" className="sr-only">
        Add hashtags
      </label>
      <input
        id="hashtag-input"
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addHashtag}
        placeholder="Add hashtags, press Enter"
        className="mt-2 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-gray-700"
      />
    </div>
  )
}
