import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import EditAboutPageClient from './EditAboutPageClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EditAboutPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Check if user is authenticated and has admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  // Fetch about page data
  const { data: aboutData, error } = await supabase
    .from('about_page')
    .select('*')
    .single()

  if (error) {
    console.error('Error fetching about page data:', error)
    redirect('/')
  }

  return <EditAboutPageClient aboutData={aboutData} />
} 