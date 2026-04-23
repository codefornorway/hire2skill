'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  'Jobs',
  'Services',
  'Tutoring',
  'Housing',
  'Items for sale',
  'Transportation',
  'Events',
  'Other',
]

type Errors = {
  title?: string
  description?: string
  category?: string
  price?: string
  location?: string
}

export default function PostForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate(): Errors {
    const e: Errors = {}
    if (!title || title.trim().length < 3) e.title = 'Title must be at least 3 characters.'
    if (!description || description.trim().length < 10) e.description = 'Description must be at least 10 characters.'
    if (!category) e.category = 'Please select a category.'
    if (!location || location.trim().length < 2) e.location = 'Location is required.'
    if (price && isNaN(Number(price))) e.price = 'Price must be a number.'
    if (price && Number(price) < 0) e.price = 'Price cannot be negative.'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError('')

    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setServerError('You must be logged in to post.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      price: price ? Number(price) : null,
      location: location.trim(),
    })

    if (error) {
      setServerError(error.message)
      setLoading(false)
      return
    }

    const cat = encodeURIComponent(category)
    router.push(`/taskers?category=${cat}&posted=1`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {serverError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Looking for a plumber in Oslo"
          className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${
            errors.title ? 'border-red-400' : 'border-zinc-300 focus:border-blue-500'
          }`}
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe the job, service, or opportunity in detail..."
          className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 resize-none ${
            errors.description ? 'border-red-400' : 'border-zinc-300 focus:border-blue-500'
          }`}
        />
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 bg-white ${
              errors.category ? 'border-red-400' : 'border-zinc-300 focus:border-blue-500'
            }`}
          >
            <option value="" disabled>Select a category</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Price <span className="text-zinc-400 font-normal">(NOK, optional)</span>
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="e.g. 500"
            className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${
              errors.price ? 'border-red-400' : 'border-zinc-300 focus:border-blue-500'
            }`}
          />
          {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="e.g. Oslo, Bergen, Trondheim..."
          className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${
            errors.location ? 'border-red-400' : 'border-zinc-300 focus:border-blue-500'
          }`}
        />
        {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)', color: 'white', opacity: loading ? 0.5 : 1 }}
        className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition"
      >
        {loading ? 'Publishing...' : 'Publish post'}
      </button>
    </form>
  )
}
