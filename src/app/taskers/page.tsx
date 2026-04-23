import { createClient } from '@/lib/supabase/server'
import TaskersContent from './TaskersContent'

const SAMPLE_TASKERS = [
  { id: 's1', display_name: 'Maria K.', bio: 'Professional cleaner with 5 years experience. I bring my own supplies and love a spotless home.', hourly_rate: 350, categories: ['Cleaning'], location: 'Oslo', verified: true, tasks_done: 52, rating: 4.9, response_hours: 1 },
  { id: 's2', display_name: 'Erik R.', bio: 'Strong and reliable. I have a van and help with moves, heavy lifting, and furniture assembly.', hourly_rate: 500, categories: ['Moving'], location: 'Bergen', verified: true, tasks_done: 38, rating: 4.8, response_hours: 2 },
  { id: 's3', display_name: 'Amina S.', bio: 'Math and science tutor for all ages. Native English speaker. 4 years tutoring experience.', hourly_rate: 400, categories: ['Tutoring'], location: 'Oslo', verified: true, tasks_done: 74, rating: 5.0, response_hours: 1 },
  { id: 's4', display_name: 'Jonas B.', bio: 'IT professional. I fix computers, set up networks, and help with phones and smart devices.', hourly_rate: 450, categories: ['IT & Tech'], location: 'Trondheim', verified: false, tasks_done: 29, rating: 4.7, response_hours: 3 },
  { id: 's5', display_name: 'Sara L.', bio: 'Event coordinator with a passion for details. Birthdays, corporate events, and more.', hourly_rate: 380, categories: ['Events'], location: 'Oslo', verified: true, tasks_done: 41, rating: 4.8, response_hours: 2 },
  { id: 's6', display_name: 'Mikkel T.', bio: 'Handyman for all small repairs — painting, shelves, furniture, plumbing fixes.', hourly_rate: 420, categories: ['Handyman'], location: 'Stavanger', verified: true, tasks_done: 63, rating: 4.9, response_hours: 1 },
]

export default async function TaskersPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const supabase = await createClient()

  const query = supabase
    .from('profiles')
    .select('*')
    .order('tasks_done', { ascending: false })
    .limit(20)

  const { data: profiles } = category
    ? await query.contains('categories', [category])
    : await query

  const taskers = profiles && profiles.length >= 2
    ? profiles
    : SAMPLE_TASKERS.filter(t => !category || t.categories.includes(category))

  return <TaskersContent taskers={taskers} activeCategory={category ?? null} />
}
